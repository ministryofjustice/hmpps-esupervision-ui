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
  renderPhotoUpload,
  renderPhotoReview,
  renderContactDetails,
  handleContactPreferences,
  renderEmail,
  renderMobile,
  renderSetUp,
  renderCheckAnswers,
  renderCases,
  handleRegister,
  renderCheckInDetail,
  renderDashboardFiltered,
  renderCreateInvite,
  renderCaseView,
  handleCreateInvite,
  renderUsers,
  renderUserCreate,
  handleCreateUser,
  handleStartRegister,
  handleRegisterComplete,
} from '../controllers/practitionersController'
import {
  personsDetailsSchema,
  contactPreferenceSchema,
  mobileSchema,
  emailSchema,
  setUpSchema,
  practitionerSchema,
  photoUploadSchema,
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
  get('/dashboard/:filter', renderDashboardFiltered)
  get('/checkin/:checkInId', renderCheckInDetail)

  get('/cases', renderCases)
  get('/cases/:offenderId', renderCaseView)
  get('/cases/:offenderId/invite', renderCreateInvite)
  router.post('/cases/:offenderId/invite', handleCreateInvite)

  get('/users', renderUsers)
  get('/users/create', renderUserCreate)
  router.post('/users/create', validateFormData(practitionerSchema), handleCreateUser)

  get('/register/start', handleStartRegister)
  get('/register', renderRegisterDetails)
  router.post('/register', validateFormData(personsDetailsSchema), handleRedirect('/practitioners/register/photo'))

  get('/register/photo', renderPhotoCapture)
  router.post('/register/photo', handleRedirect('/practitioners/register/photo/review'))
  get('/register/photo/upload', renderPhotoUpload)
  router.post(
    '/register/photo/upload',
    validateFormData(photoUploadSchema),
    handleRedirect('/practitioners/register/photo/review'),
  )
  get('/register/photo/review', renderPhotoReview)

  get('/register/contact', renderContactDetails)
  router.post('/register/contact', validateFormData(contactPreferenceSchema), handleContactPreferences)

  get('/register/contact/mobile', renderMobile)
  router.post(
    '/register/contact/mobile',
    validateFormData(mobileSchema),
    handleRedirect('/practitioners/register/set-up'),
  )

  get('/register/contact/email', renderEmail)
  router.post(
    '/register/contact/email',
    validateFormData(emailSchema),
    handleRedirect('/practitioners/register/set-up'),
  )

  get('/register/set-up', renderSetUp)
  router.post(
    '/register/set-up',
    validateFormData(setUpSchema),
    handleRedirect('/practitioners/register/check-answers'),
  )

  get('/register/check-answers', renderCheckAnswers)
  get('/register/details', handleRegister)
  router.post('/register/complete', handleRegisterComplete)

  return router
}
