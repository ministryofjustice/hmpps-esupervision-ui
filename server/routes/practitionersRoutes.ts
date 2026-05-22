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
  handleRegisterBegin,
  renderCheckInDetail,
  renderDashboardFiltered,
  renderCreateInvite,
  renderCaseView,
  handleCreateInvite,
  handleStartRegister,
  handleRegisterComplete,
  renderUpdatePersonalDetails,
  renderUpdatePhoto,
  renderUpdateContactDetails,
  renderUpdateCheckinSettings,
  renderCheckInVideoDetail,
  handleCheckInReview,
  validateRegisterPoPData,
  handlePhotoPost,
  handleUpdateOffender,
  renderUpdateOffender,
  renderUpdateMobile,
  renderUpdateEmail,
  renderStopCheckins,
  handleStopCheckins,
  renderUserInfo,
  handleGetUserInfo,
  handleCheckIfContactDetailsExist,
  handleResendInvite,
} from '../controllers/practitionersController'
import {
  personsDetailsSchema,
  contactPreferenceSchema,
  mobileSchema,
  emailSchema,
  setUpSchema,
  photoUploadSchema,
  videoReviewSchema,
} from '../schemas/practitionersSchemas'
import {
  inviteCrnSchema,
  inviteContactPreferenceSchema,
  inviteEmailSchema,
  inviteMobileSchema,
} from '../schemas/invitePopSchemas'
import {
  handleInviteContactPreferences,
  handleInviteRedirect,
  handleInviteSubmit,
  handleStartInvitePop,
  renderInviteCheckAnswers,
  renderInviteConfirmation,
  renderInviteContact,
  renderInviteCrn,
  renderInviteEmail,
  renderInviteMobile,
} from '../controllers/invitePopController'

export default function routes(): Router {
  const router = Router()

  // practitioner routes all require a login
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)
  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  router.use(authorisationMiddleware(config.authorisedUserRoles))
  router.use(setUpCurrentUser())

  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderDashboard)
  get('/privacy-notice', (req, res, next) => {
    res.render('pages/practitioners/privacy')
  })
  get('/accessibility', (req, res, next) => {
    res.render('pages/practitioners/accessibility')
  })
  get('/dashboard', renderDashboard)
  get('/dashboard/:filter', renderDashboardFiltered)
  get('/checkin/:checkInId', renderCheckInDetail)
  router.post('/checkin/:checkInId', validateFormData(videoReviewSchema), handleCheckInReview)
  get('/checkin/:checkInId/video', renderCheckInVideoDetail)
  get('/checkin/:checkinId/resend', handleResendInvite)
  get('/cases', renderCases(false))
  get('/cases/stopped', renderCases(true))
  get('/cases/:offenderId', renderCaseView)
  get('/cases/:offenderId/invite', renderCreateInvite)
  router.post('/cases/:offenderId/invite', handleCreateInvite)

  get('/cases/:offenderId/update/personal-details', renderUpdatePersonalDetails)
  get('/cases/:offenderId/update/photo', renderUpdatePhoto)
  get('/cases/:offenderId/update/contact-details', renderUpdateContactDetails)
  get('/cases/:offenderId/update/mobile', renderUpdateMobile)
  get('/cases/:offenderId/update/email', renderUpdateEmail)
  get('/cases/:offenderId/update/checkin-settings', renderUpdateCheckinSettings)
  get('/cases/:offenderId/update/stop-checkins', renderStopCheckins)

  router.post(
    '/cases/:offenderId/update/personal-details',
    renderUpdateOffender('personal-details', 'personal'),
    handleUpdateOffender,
  )

  router.post('/cases/:offenderId/update/stop-checkins', handleStopCheckins)

  router.post('/cases/:offenderId/update/contact-details', (req, res) => {
    if (req.body?.contactPreference === 'TEXT') {
      res.redirect(`/practitioners/cases/${req.params.offenderId}/update/mobile`)
    } else {
      res.redirect(`/practitioners/cases/${req.params.offenderId}/update/email`)
    }
  })

  router.post('/cases/:offenderId/update/mobile', renderUpdateOffender('mobile', 'mobile'), handleUpdateOffender)
  router.post('/cases/:offenderId/update/email', renderUpdateOffender('email', 'email'), handleUpdateOffender)
  router.post(
    '/cases/:offenderId/update/checkin-settings',
    renderUpdateOffender('checkin-settings', 'setup'),
    handleUpdateOffender,
  )

  get('/register/start', handleStartRegister)
  get('/register', renderRegisterDetails)
  router.post('/register', validateFormData(personsDetailsSchema), handleRedirect('/practitioners/register/photo'))

  get('/register/photo', renderPhotoCapture)
  router.post('/register/photo', handlePhotoPost)
  get('/register/photo/upload', renderPhotoUpload)
  router.post('/register/photo/upload', validateFormData(photoUploadSchema), handlePhotoPost)
  get('/register/photo/review', renderPhotoReview)

  get('/register/contact', renderContactDetails)
  router.post('/register/contact', validateFormData(contactPreferenceSchema), handleContactPreferences)

  get('/register/contact/mobile', renderMobile)
  router.post(
    '/register/contact/mobile',
    validateFormData(mobileSchema),
    handleCheckIfContactDetailsExist('phone_number'),
    handleRedirect('/practitioners/register/set-up'),
  )

  get('/register/contact/email', renderEmail)
  router.post(
    '/register/contact/email',
    validateFormData(emailSchema),
    handleCheckIfContactDetailsExist('email'),
    handleRedirect('/practitioners/register/set-up'),
  )

  get('/register/set-up', renderSetUp)
  router.post(
    '/register/set-up',
    validateFormData(setUpSchema),
    handleRedirect('/practitioners/register/check-answers'),
  )

  router.get('/register/check-answers', validateRegisterPoPData, renderCheckAnswers)

  // The following two routes start and end the setup process on the backend
  // At the moment, `/begin` is called from client (browser), `/complete` is called from server
  router.post('/register/begin', handleRegisterBegin)
  router.post('/register/complete', handleRegisterComplete)

  // Data dashboard
  get('/data/user', renderUserInfo)
  router.post('/data/user', handleGetUserInfo)

  // Invite PoP journey
  get('/invite-pop/start', handleStartInvitePop)
  get('/invite-pop', renderInviteCrn)
  router.post(
    '/invite-pop',
    validateFormData(inviteCrnSchema),
    handleInviteRedirect('/practitioners/invite-pop/contact'),
  )

  get('/invite-pop/contact', renderInviteContact)
  router.post('/invite-pop/contact', validateFormData(inviteContactPreferenceSchema), handleInviteContactPreferences)

  get('/invite-pop/contact/email', renderInviteEmail)
  router.post(
    '/invite-pop/contact/email',
    validateFormData(inviteEmailSchema),
    handleInviteRedirect('/practitioners/invite-pop/check-answers'),
  )

  get('/invite-pop/contact/mobile', renderInviteMobile)
  router.post(
    '/invite-pop/contact/mobile',
    validateFormData(inviteMobileSchema),
    handleInviteRedirect('/practitioners/invite-pop/check-answers'),
  )

  get('/invite-pop/check-answers', renderInviteCheckAnswers)
  router.post('/invite-pop/check-answers', handleInviteSubmit)

  get('/invite-pop/confirmation', renderInviteConfirmation)

  return router
}
