import type { Request, Response, NextFunction } from 'express'
import { LRUCache } from 'lru-cache'
import { Reader } from '@maxmind/geoip2-node'
import { readFileSync } from 'fs'
import path from 'path'
import logger from '../../logger'
import { services } from '../services'

const { esupervisionService } = services()

const ALLOWED_COUNTRY = 'GB'
const BYPASS_PATHS = ['/health', '/ping', '/assets', '/info'] // health check and static asset paths
const file = './../../assets/geo/GeoLite2-Country.mmdb'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 1 day

const cache = new LRUCache<string, { countryCode: string | null }>({
  max: 10_000,
  ttl: CACHE_TTL_MS,
})

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

function localDevBypass(ip: string): boolean {
  if (!ip) return true
  if (ip === '::1' || ip.startsWith('127.')) return true // localhost
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true // common private ranges
  if (ip.startsWith('172.')) {
    const oct = Number(ip.split('.')[1])
    if (oct >= 16 && oct <= 31) return true
  }
  return false
}

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

    // 2) Get IP
    const ip = getClientIp(req)
    const matches = req.path.match(/\/submission\/([0-9a-z-]*)[#?]*.*/)
    const checkinId = matches && matches[1] ? matches[1] : undefined
    const logAccess = checkinId ? logOutsideAccess : async (_checkinId: string, _ip: string, _countryCode: string) => {}

    // 3) Allow local development to bypass
    if (localDevBypass(ip)) return next()

    // 4) Check the cache
    const cached = cache.get(ip)
    if (cached) {
      if (!isAllowed(cached.countryCode)) {
        logger.warn({ ip, country: cached.countryCode, path: req.path, checkinId }, 'Blocked non-UK request (cache)')
        await logAccess(checkinId, ip, cached.countryCode)
        return res.status(403).render('pages/outside-uk')
      }
      return next()
    }

    try {
      // 5) Get the IP details
      const dbBuffer = readFileSync(path.resolve(__dirname, file))
      const reader = Reader.openBuffer(dbBuffer)
      const response = reader.country(ip)
      const countryCode = response.country.isoCode

      // 7) Cache result
      cache.set(ip, { countryCode })

      // 8) Enforce UK/GB only
      if (!isAllowed(countryCode)) {
        logger.warn({ ip, country: countryCode, path: req.path, checkinId }, 'Blocked non-UK request')
        await logAccess(checkinId, ip, countryCode)
        return res.status(403).render('pages/outside-uk')
      }

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
