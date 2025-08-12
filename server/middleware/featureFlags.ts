import type { Request, Response, NextFunction } from 'express'
import { defaultFlags } from '../utils/flags'

const COOKIE_NAME = 'es-feature-flags'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

export default function featureFlags() {
  return (req: Request, res: Response, next: NextFunction) => {
    const flags = { ...defaultFlags }

    const cookieFlags = (req.signedCookies?.[COOKIE_NAME] || {}) as Record<string, 'on' | 'off'>
    for (const [key, val] of Object.entries(cookieFlags)) {
      if (key in flags) flags[key as keyof typeof flags] = val === 'on'
    }

    const qsOverrides: Record<string, 'on' | 'off'> = {}
    for (const [k, v] of Object.entries(req.query)) {
      // eslint-disable-next-line no-continue
      if (!k.startsWith('es-')) continue
      const flagKey = k.replace(/^es-/, '')
      const val = String(v).toLowerCase()
      if (flagKey in flags && (val === 'on' || val === 'off')) {
        flags[flagKey as keyof typeof flags] = val === 'on'
        qsOverrides[flagKey] = val
      }
    }

    if (Object.keys(qsOverrides).length) {
      const merged = { ...cookieFlags, ...qsOverrides }
      res.cookie(COOKIE_NAME, merged, {
        httpOnly: true,
        sameSite: 'lax',
        signed: true,
        maxAge: COOKIE_MAX_AGE,
      })
    }

    res.locals.flags = flags
    next()
  }
}
