import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    return res.render('pages/index')
  })

  get('/privacy-notice', (req, res, next) => {
    res.render('pages/privacy')
  })

  get('/accessibility', (req, res, next) => {
    res.render('pages/accessibility')
  })

  return router
}
