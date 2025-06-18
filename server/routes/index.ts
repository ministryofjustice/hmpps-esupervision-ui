import { type RequestHandler, Router } from 'express'

import { format } from 'date-fns/format'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'

export default function routes({ esupervisionService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    return res.render('pages/index')
  })

  get('/test', async (req, res, next) => {
    const currentDateTime = await esupervisionService.getCurrentTime()
    const formattedDate = format(currentDateTime, "h:mmaaa 'on' EEEE, do MMMM yyyy")
    return res.render('pages/test', { formattedDate })
  })

  return router
}
