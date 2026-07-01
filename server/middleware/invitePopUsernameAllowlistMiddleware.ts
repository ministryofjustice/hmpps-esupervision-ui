import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import logger from '../../logger'
import asyncMiddleware from './asyncMiddleware'

// TEMPORARY: stands in for authorisationMiddleware on invite-pop routes while access is restricted
// to a fixed list of HMPPS usernames instead of a role. Switch config.invitePopRestrictByUsername
// back to false to use authorisationMiddleware again, then delete this file.
export default function invitePopUsernameAllowlistMiddleware(allowedUsernames: string[] = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    if (res.locals?.user?.token) {
      const { name, user_name: userName } = jwtDecode(res.locals.user.token) as { name: string; user_name: string }

      if (allowedUsernames.includes((userName ?? '').toUpperCase())) {
        logger.info(`User ${name} (${userName}) is authorised to access invite-pop by username allowlist`)
        return next()
      }

      logger.error(`User ${name} (${userName}) is not authorised to access invite-pop`)
      return res.render('./pages/practitioners/invite-pop/auth-error')
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
