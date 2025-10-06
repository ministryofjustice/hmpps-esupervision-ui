import { jwtDecode } from 'jwt-decode'
import type { RequestHandler } from 'express'

import logger from '../../logger'
import asyncMiddleware from './asyncMiddleware'

function findRole(userRoles: string[], authorisedAuthorities: string[]): string | undefined {
  return userRoles.find(role => authorisedAuthorities.includes(role))
}

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return asyncMiddleware((req, res, next) => {
    // authorities in the user token will always be prefixed by ROLE_.
    // Convert roles that are passed into this function without the prefix so that we match correctly.
    const authorisedAuthorities = authorisedRoles.map(role => (role.startsWith('ROLE_') ? role : `ROLE_${role}`))
    if (res.locals?.user?.token) {
      const {
        authorities: roles = [],
        name,
        user_name: userName,
      } = jwtDecode(res.locals.user.token) as { authorities?: string[]; name: string; user_name: string }

      if (authorisedAuthorities.length > 0) {
        const matchingRole = findRole(roles, authorisedAuthorities)
        if (matchingRole) {
          logger.info(`User ${name} (${userName}) is authorised to access dashboard by role ${matchingRole}`)
        } else {
          logger.error(`User ${name} (${userName}) is not authorised to access dashboard`)
          logger.error(`User has roles '${roles}', required one of ${authorisedAuthorities}`)
          return res.redirect('/authError')
        }
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })
}
