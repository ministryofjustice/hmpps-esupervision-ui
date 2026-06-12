import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { RequestHandler } from 'express'
import { v4 } from 'uuid'
import logger from '../../logger'
import { services } from '../services'

const { popService } = services()

const INVITE_BASE = '/practitioners/invite-pop'
const CHECK_ANSWERS_PATH = `${INVITE_BASE}/check-answers`

export const handleInviteRedirect = (nextUrl: string): RequestHandler => {
  return (req, res) => {
    if (req.query.checkAnswers === 'true') {
      res.redirect(CHECK_ANSWERS_PATH)
      return
    }
    res.redirect(nextUrl)
  }
}

export const handleStartInvitePop: RequestHandler = (req, res) => {
  req.session.formData = {}
  res.redirect(INVITE_BASE)
}

export const renderInviteCrn: RequestHandler = (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/invite-pop/crn', { cya })
  } catch (error) {
    next(error)
  }
}

export const renderInviteContact: RequestHandler = (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/invite-pop/contact/index', { cya })
  } catch (error) {
    next(error)
  }
}

export const handleInviteContactPreferences: RequestHandler = (req, res) => {
  const { contactPreference, checkYourAnswers } = req.body
  const target = contactPreference === 'EMAIL' ? 'email' : 'mobile'
  const suffix = checkYourAnswers === 'true' ? '?checkAnswers=true' : ''
  res.redirect(`${INVITE_BASE}/contact/${target}${suffix}`)
}

export const renderInviteEmail: RequestHandler = (req, res, next) => {
  try {
    req.session.formData.mobile = undefined
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/invite-pop/contact/email', { cya })
  } catch (error) {
    next(error)
  }
}

export const renderInviteMobile: RequestHandler = (req, res, next) => {
  try {
    req.session.formData.email = undefined
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/invite-pop/contact/mobile', { cya })
  } catch (error) {
    next(error)
  }
}

export const renderInviteCheckAnswers: RequestHandler = (req, res, next) => {
  try {
    const { crn, contactPreference, email, mobile } = res.locals.formData || {}
    if (
      !crn ||
      !contactPreference ||
      (contactPreference === 'EMAIL' && !email) ||
      (contactPreference === 'TEXT' && !mobile)
    ) {
      res.redirect(INVITE_BASE)
      return
    }
    res.render('pages/practitioners/invite-pop/check-answers')
  } catch (error) {
    next(error)
  }
}

export const handleInviteSubmit: RequestHandler = async (req, res, next) => {
  const formData = res.locals.formData || {}
  const { crn, contactPreference, email, mobile } = formData as {
    crn?: string
    contactPreference?: 'EMAIL' | 'TEXT'
    email?: string
    mobile?: string
  }

  if (!crn || !contactPreference) {
    res.redirect(INVITE_BASE)
    return
  }

  try {
    const contactValue = contactPreference === 'EMAIL' ? email : mobile

    await popService.invitePop({
      crn,
      email: contactPreference === 'EMAIL' ? email : undefined,
      mobile: contactPreference === 'TEXT' ? mobile : undefined,
    })

    req.session.formData = {
      invitedCrn: crn,
      invitedContactPreference: contactPreference,
      invitedContactValue: contactValue,
    }
    res.redirect(`${INVITE_BASE}/confirmation`)
  } catch (error) {
    if (error?.responseStatus === 409) {
      logger.info(`An invite has already been submitted for CRN ${crn}`)
      res.status(409).render('pages/practitioners/invite-pop/error', {
        crn,
        message: error?.data?.userMessage,
      })
      return
    }
    logger.error('Failed to send invite', error)
    next(error)
  }
}

export const renderInviteConfirmation: RequestHandler = async (req, res, next) => {
  try {
    const { invitedCrn, invitedContactPreference, invitedContactValue } = (res.locals.formData || {}) as {
      invitedCrn?: string
      invitedContactPreference?: 'EMAIL' | 'TEXT'
      invitedContactValue?: string
    }

    if (!invitedCrn || !invitedContactValue) {
      res.redirect(INVITE_BASE)
      return
    }

    await auditService.sendAuditMessage({
      action: 'COMPLETED_INVITE_POP_JOURNEY',
      who: res.locals.user.username,
      subjectId: invitedCrn,
      subjectType: 'CRN',
      correlationId: v4(),
      service: 'hmpps-esupervision-ui',
    })

    res.render('pages/practitioners/invite-pop/confirmation', {
      crn: invitedCrn,
      contactPreference: invitedContactPreference,
      contactValue: invitedContactValue,
    })
  } catch (error) {
    next(error)
  }
}

export const renderGuidance: RequestHandler = (req, res, next) => {
  try {
    res.render('pages/practitioners/invite-pop/guidance')
  } catch (error) {
    next(error)
  }
}
