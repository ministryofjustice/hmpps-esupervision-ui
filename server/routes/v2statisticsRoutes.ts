import { type RequestHandler, Router } from 'express'
import { VerificationClient, AuthenticatedRequest } from '@ministryofjustice/hmpps-auth-clients'
import asyncMiddleware from '../middleware/asyncMiddleware'
import config from '../config'
import { renderV2stats } from '../controllers/v2statisticsController'
import logger from '../../logger'

export default function routes(): Router {
  const router = Router()

  // Data routes all require a login
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)
  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderV2stats)

  return router
}
