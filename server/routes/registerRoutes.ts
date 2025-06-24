import { type RequestHandler, Router } from 'express'
import validateFormData from '../middleware/validateFormData'
import asyncMiddleware from '../middleware/asyncMiddleware'
import {
  handleStart,
  handleContactPreferences,
  handleMobile,
  handleRedirect,
  handlePhotoReview,
  renderCheckAnswers,
  renderConfirmation,
  renderContactDetails,
  renderIndex,
  renderPersonalDetails,
  renderPhotoCapture,
  renderPhotoInform,
  renderPhotoReview,
  renderMobile,
  renderEmail,
} from '../controllers/registerController'

import {
  personalDetailsSchema,
  photoReviewSchema,
  contactPreferenceSchema,
  emailSchema,
  mobileSchema,
  checkAnswersSchema,
} from '../schemas/registerSchemas'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderIndex)
  router.post('/start', handleStart)

  get('/personal-details', renderPersonalDetails)
  router.post('/personal-details', validateFormData(personalDetailsSchema), handleRedirect('/register/photo/inform'))

  get('/photo/inform', renderPhotoInform)
  get('/photo/capture', renderPhotoCapture)

  get('/photo/review', renderPhotoReview)
  router.post('/photo/review', validateFormData(photoReviewSchema), handlePhotoReview)

  get('/contact-details', renderContactDetails)
  router.post('/contact-details', validateFormData(contactPreferenceSchema), handleContactPreferences)

  get('/contact-details/mobile', renderMobile)
  router.post('/contact-details/mobile', validateFormData(mobileSchema), handleMobile)

  get('/contact-details/email', renderEmail)
  router.post('/contact-details/email', validateFormData(emailSchema), handleRedirect('/register/check-your-answers'))

  get('/check-your-answers', renderCheckAnswers)
  router.post('/check-your-answers', validateFormData(checkAnswersSchema), (req, res) => {
    // API call to save submission data would go here
    // For now, we just redirect to confirmation
    res.redirect('/register/confirmation')
  })
  get('/confirmation', renderConfirmation)

  return router
}
