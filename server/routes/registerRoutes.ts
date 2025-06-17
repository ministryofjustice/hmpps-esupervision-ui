import { type RequestHandler, Router } from 'express'
import validateFormData from '../middleware/validateFormData'
import asyncMiddleware from '../middleware/asyncMiddleware'
import {
  handleStart,
  handlePersonalDetails,
  renderCheckAnswers,
  renderConfirmation,
  renderContactDetails,
  renderIndex,
  renderPersonalDetails,
  renderPhotoCapture,
  renderPhotoInform,
  renderPhotoReview,
} from '../controllers/registerController'

import { personalDetailsSchema, photoReviewSchema } from '../schemas/registerSchemas'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderIndex)
  router.post('/start', handleStart)

  get('/personal-details', renderPersonalDetails)
  router.post('/personal-details', validateFormData(personalDetailsSchema), handlePersonalDetails)

  get('/photo/inform', renderPhotoInform)
  get('/photo/capture', renderPhotoCapture)

  get('/photo/review', renderPhotoReview)
  router.post('/photo/review', validateFormData(photoReviewSchema), renderContactDetails)

  get('/contact-details', renderContactDetails)

  get('/check-your-answers', renderCheckAnswers)
  get('/confirmation', renderConfirmation)

  return router
}
