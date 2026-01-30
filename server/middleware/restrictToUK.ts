import type { Request, Response, NextFunction } from 'express'
// import { LRUCache } from 'lru-cache'
// import { z } from 'zod'
import { Reader } from '@maxmind/geoip2-node'
import { readFileSync } from 'fs'
import path from 'path'
import logger from '../../logger'
import { services } from '../services'

const { esupervisionService } = services()

// const IP_INFO_TOKEN = process.env.IP_INFO_TOKEN ?? ''
const ALLOWED_COUNTRY = 'GB'
const BYPASS_PATHS = ['/ping', '/assets', '/info'] // health check and static asset paths
const file = './../../assets/geo/GeoLite2-Country.mmdb'
// const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 1 day

// const cache = new LRUCache<string, { countryCode: string | null }>({
//   max: 10_000,
//   ttl: CACHE_TTL_MS,
// })

// const IPInfoAPISchema = z.object({
//   ip: z.string().optional(),
//   asn: z.string().optional(),
//   as_name: z.string().optional(),
//   as_domain: z.string().optional(),
//   country_code: z.string().length(2).optional(),
//   country: z.string().optional(),
//   continent_code: z.string().optional(),
//   continent: z.string().optional(),
// })

function normaliseIp(ip: string | undefined | null): string {
  if (!ip) return ''
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip
}

function getClientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    const first = xff.split(',')[0].trim()
    if (first) return normaliseIp(first)
  }
  return normaliseIp(req.ip || req.socket?.remoteAddress || '')
}

// function localDevBypass(ip: string): boolean {
//   if (!ip) return true
//   if (ip === '::1' || ip.startsWith('127.')) return true // localhost
//   if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true // common private ranges
//   if (ip.startsWith('172.')) {
//     const oct = Number(ip.split('.')[1])
//     if (oct >= 16 && oct <= 31) return true
//   }
//   return false
// }

function isAllowed(countryCode: string | null): boolean {
  return (countryCode ?? '').toUpperCase() === ALLOWED_COUNTRY
}

const logOutsideAccess = async (checkinId: string, ip: string, countryCode: string) => {
  if (checkinId) {
    await esupervisionService.logCheckinEvent(
      checkinId,
      'CHECKIN_OUTSIDE_ACCESS',
      `ip=${ip} countryCode=${countryCode}`,
    )
  }
}

export default async function restrictToUK(req: Request, res: Response, next: NextFunction) {
  logger.info({ path: req.path }, 'Starting restrictToUK process')

  try {
    // 1) Bypass specific paths
    if (BYPASS_PATHS.some(prefix => req.path.startsWith(prefix))) {
      return next()
    }

    // 2) If missing token, log a warning and allow user to access the site
    // if (!IP_INFO_TOKEN) {
    //   logger.warn({ path: req.path }, 'IP_INFO_TOKEN not set - allowing traffic')
    //   return next()
    // }

    // 3) Get IP
    const ip = getClientIp(req)
    const matches = req.path.match(/\/submission\/([0-9a-z-]*)[#?]*.*/)
    const checkinId = matches && matches[1] ? matches[1] : undefined
    const logAccess = checkinId ? logOutsideAccess : async (_checkinId: string, _ip: string, _countryCode: string) => {}

    // 4) Allow local development to bypass
    // if (localDevBypass(ip)) return next()

    // 5) Cache
    // const cached = cache.get(ip)
    // if (cached) {
    //   if (!isAllowed(cached.countryCode)) {
    //     logger.warn({ ip, country: cached.countryCode, path: req.path, checkinId }, 'Blocked non-UK request (cache)')
    //     await logAccess(checkinId, ip, cached.countryCode)
    //     return res.status(403).render('pages/outside-uk')
    //   }
    //   return next()
    // }

    // 6) Lookup IP information
    // const url = `https://api.ipinfo.io/lite/${ip}?token=${IP_INFO_TOKEN}`

    // try {
    //   const resp = await fetch(url)

    //   if (!resp.ok) {
    //     logger.error({ ip, status: resp.status }, 'IP lookup failed')
    //     // Allow user to continue on failure
    //     return next()
    //   }

    //   const json = await resp.json()

    //   const parsed = IPInfoAPISchema.safeParse(json)
    //   if (!parsed.success) {
    //     const issues = parsed.error.issues.map(err => err.message)
    //     logger.error({ ip, issues }, 'IP lookup response validation failed')
    //     // Allow user to continue on failure
    //     return next()
    //   }

    //   const { data } = parsed
    //   const countryCode = data.country_code ?? null

    // Synchronous database opening
    try {
      // Check that the file exists locally
      // console.log("Check that the file exists locally");
      // if(!existsSync(path.resolve(__dirname, file))) {
      //   console.log("File not found");
      //   return next()
      // }

      // console.log("Reader.open");
      // Reader.open(path.resolve(__dirname, file)).then(reader => {
      //   const response = reader.country(ip);

      //   console.log(response.country.isoCode); // 'US'
      // });

      // console.log('readFileSync')
      const dbBuffer = readFileSync(path.resolve(__dirname, file))

      // This reader object should be reused across lookups as creation of it is expensive.
      // console.log('Reader.openBuffer')
      const reader = Reader.openBuffer(dbBuffer)

      // console.log('reader.country')
      // console.log(reader.country(ip))
      const response = reader.country('128.101.101.101')

      // console.log('response.country.isoCode')
      const countryCode = response.country.isoCode
      logger.info({ country: countryCode, path: req.path }, 'IP from')
      // console.log(countryCode)

      // 7) Cache result
      // cache.set(ip, { countryCode })

      // 8) Enforce UK/GB only
      if (!isAllowed(countryCode)) {
        logger.warn({ ip, country: countryCode, path: req.path, checkinId }, 'Blocked non-UK request')
        await logAccess(checkinId, ip, countryCode)
        return res.status(403).render('pages/outside-uk')
      }
      logger.warn({ ip, country: countryCode, path: req.path, checkinId }, 'Not blocked UK request')

      return next()
    } catch (e) {
      logger.error({ ip, err: e }, 'IP lookup error')
      // Allow user to continue on failure
      return next()
    }
  } catch (err) {
    logger.error({ err }, 'restrictToUK middleware error')
    // Allow user to continue on failure
    return next()
  }
}

// export default async function restrictToUK(req: Request, res: Response, next: NextFunction) {

//   // Asynchronous database opening
//   // const Reader = require('@maxmind/geoip2-node').Reader;

//   // Reader.open('/path/to/maxmind-database.mmdb').then((reader) => {
//   //   const response = reader.city('128.101.101.101');

//   //   console.log(response.country.isoCode);
//   // });

//   // Synchronous database opening
//   const fs = require('fs');
//   const Reader = require('@maxmind/geoip2-node').Reader;

//   const dbBuffer = fs.readFileSync('/assets/geo/GeoLite2-ASN.mmdb');

//   // This reader object should be reused across lookups as creation of it is
//   // expensive.
//   const reader = Reader.openBuffer(dbBuffer);

//   const response = reader.city('128.101.101.101');

//   console.log(response.country.isoCode);

// }
