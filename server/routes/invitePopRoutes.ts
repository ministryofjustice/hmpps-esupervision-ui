import { type RequestHandler, Router } from 'express'
import { VerificationClient, AuthenticatedRequest } from '@ministryofjustice/hmpps-auth-clients'
import asyncMiddleware from '../middleware/asyncMiddleware'
import config from '../config'
import validateFormData from '../middleware/validateFormData'
import authorisationMiddleware from '../middleware/authorisationMiddleware'
import invitePopUsernameAllowlistMiddleware from '../middleware/invitePopUsernameAllowlistMiddleware'
import setUpCurrentUser from '../middleware/setUpCurrentUser'
import logger from '../../logger'

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
  renderGuidance,
  renderInviteCheckAnswers,
  renderInviteConfirmation,
  renderInviteContact,
  renderInviteCrn,
  renderInviteEmail,
  renderInviteMobile,
} from '../controllers/invitePopController'

export default function routes(): Router {
  const router = Router()

  // invite-pop routes all require a login
  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)
  router.use(async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  })

  if (config.invitePopRestrictByUsername) {
    router.use(invitePopUsernameAllowlistMiddleware(config.invitePopAllowedUsernames))
  } else {
    router.use(authorisationMiddleware(config.invitePopUserRoles))
  }
  router.use(setUpCurrentUser())

  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  // Invite PoP journey
  get('/start', handleStartInvitePop)
  get('/', renderInviteCrn)
  router.post('/', validateFormData(inviteCrnSchema), handleInviteRedirect('/invite-pop/contact'))

  get('/contact', renderInviteContact)
  router.post('/contact', validateFormData(inviteContactPreferenceSchema), handleInviteContactPreferences)

  get('/contact/email', renderInviteEmail)
  router.post('/contact/email', validateFormData(inviteEmailSchema), handleInviteRedirect('/invite-pop/check-answers'))

  get('/contact/mobile', renderInviteMobile)
  router.post(
    '/contact/mobile',
    validateFormData(inviteMobileSchema),
    handleInviteRedirect('/invite-pop/check-answers'),
  )

  get('/check-answers', renderInviteCheckAnswers)
  router.post('/check-answers', handleInviteSubmit)

  get('/confirmation', renderInviteConfirmation)
  get('/guidance', renderGuidance)

  return router
}
