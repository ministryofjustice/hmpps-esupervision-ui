import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import {
  renderCheckAnswers,
  renderConfirmation,
  renderContactDetails,
  renderIndex,
  renderPersonalDetails,
  renderPhotoCapture,
  renderPhotoInform,
  renderPhotoReview,
} from '../controllers/registerController'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderIndex)
  get('/personal-details', renderPersonalDetails)
  get('/photo/inform', renderPhotoInform)
  get('/photo/capture', renderPhotoCapture)
  get('/photo/review', renderPhotoReview)

  get('/contact-details', renderContactDetails)

  get('/check-your-answers', renderCheckAnswers)
  get('/confirmation', renderConfirmation)

  return router
}
