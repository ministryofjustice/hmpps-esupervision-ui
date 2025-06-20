import { type RequestHandler, Router } from 'express'
import { VerificationClient, AuthenticatedRequest } from '@ministryofjustice/hmpps-auth-clients'
import asyncMiddleware from '../middleware/asyncMiddleware'
import config from '../config'
import validateFormData from '../middleware/validateFormData'
import authorisationMiddleware from '../middleware/authorisationMiddleware'
import setUpCurrentUser from '../middleware/setUpCurrentUser'
import logger from '../../logger'

import {
  handleRedirect,
  renderDashboard,
  renderRegisterDetails,
  renderPhotoCapture,
  renderPhotoReview,
  renderContactDetails,
  handleContactPreferences,
  renderEmail,
  renderMobile,
  handleMobile,
  renderStartDate,
  renderFrequency,
  renderCheckAnswers,
  handleRegister,
} from '../controllers/practitionersController'
import {
  personsDetailsSchema,
  contactPreferenceSchema,
  mobileSchema,
  emailSchema,
  startDateSchema,
  frequencySchema,
} from '../schemas/practitionersSchemas'


export default function routes(): Router {
  const router = Router({ mergeParams: true })

  // practitioner routes all require a login
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)
  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  router.use(authorisationMiddleware())
  router.use(setUpCurrentUser())

  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderDashboard)
  get('/dashboard', renderDashboard)

  get('/register', renderRegisterDetails)
  router.post('/register', validateFormData(personsDetailsSchema), handleRedirect('/practitioners/register/photo'))

  get('/register/photo', renderPhotoCapture)
  get('/register/photo/review', renderPhotoReview)

  get('/register/contact', renderContactDetails)
  router.post('/register/contact', validateFormData(contactPreferenceSchema), handleContactPreferences)

  get('/register/contact/mobile', renderMobile)
  router.post('/register/contact/mobile', validateFormData(mobileSchema), handleMobile)

  get('/register/contact/email', renderEmail)
  router.post(
    '/register/contact/email',
    validateFormData(emailSchema),
    handleRedirect('/practitioners/register/start-date'),
  )

  get('/register/start-date', renderStartDate)
  router.post(
    '/register/start-date',
    validateFormData(startDateSchema),
    handleRedirect('/practitioners/register/frequency'),
  )

  get('/register/frequency', renderFrequency)
  router.post(
    '/register/frequency',
    validateFormData(frequencySchema),
    handleRedirect('/practitioners/register/check-answers'),
  )

  get('/register/check-answers', renderCheckAnswers)
  router.post('/register/check-answers', handleRegister)

  return router
}
