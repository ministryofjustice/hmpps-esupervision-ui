import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { renderDashboard, renderRegisterDetails } from '../controllers/practitionersController'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/dashboard', renderDashboard)

  get('/register', renderRegisterDetails)

  return router
}
