import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    return res.redirect('/practitioners/')
  })

  get('/privacy-notice', (req, res, next) => {
    res.render('pages/privacy')
  })

  get('/accessibility', (req, res, next) => {
    res.render('pages/accessibility')
  })

  get('/.well-known/appspecific/com.chrome.devtools.json', async (req, res, next) => {
    return res.status(404).render('pages/error')
  })

  return router
}
