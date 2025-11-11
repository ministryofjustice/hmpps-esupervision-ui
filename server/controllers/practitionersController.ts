import { NextFunction, Request, RequestHandler, Response } from 'express'
import { add, format, isBefore, parse } from 'date-fns'

import { v4 as uuidv4 } from 'uuid'
import { ZodIntersection, ZodObject } from 'zod'
import { services } from '../services'
import Checkin from '../data/models/checkin'
import Page from '../data/models/page'
import getUserFriendlyString from '../utils/userFriendlyStrings'
import CheckinInterval from '../data/models/checkinInterval'
import logger from '../../logger'
import {
  emailSchema,
  mobileSchema,
  OffenderInfoInput,
  personsDetailsSchema,
  stopCheckinsSchema,
  updateSetUpSchema,
} from '../schemas/practitionersSchemas'
import OffenderUpdate from '../data/models/offenderUpdate'
import OffenderUpdateError from '../data/offenderUpdateError'
import { calculateNextCheckinDate } from '../utils/utils'
import Offender from '../data/models/offender'
import OffenderInfoByContact from '../data/models/offenderInfoByContact'

const { esupervisionService } = services()

export const handleRedirect = (url: string): RequestHandler => {
  return (req, res) => {
    let redirectUrl = url
    if (req.query.checkAnswers === 'true') {
      logger.info('Redirecting to check answers page', { checkAnswers: req.query.checkAnswers })
      redirectUrl = '/practitioners/register/check-answers'
    }
    res.redirect(redirectUrl)
  }
}

export const renderDashboard: RequestHandler = async (req, res, next) => {
  try {
    // eslint-disable-next-line prefer-destructuring
    res.locals.successMessage = req.flash('success')[0]
    const practitioner = res.locals.user
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 60
    const rawCheckIns = await esupervisionService.getCheckins(practitioner, page, size)
    const checkIns = filterCheckIns(rawCheckIns)
    res.render('pages/practitioners/dashboard', { checkIns, practitionerUuid: practitioner.userId })
  } catch (error) {
    next(error)
  }
}

export const renderDashboardFiltered: RequestHandler = async (req, res, next) => {
  try {
    const { filter } = req.params
    const practitioner = res.locals.user
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 60
    const rawCheckIns = await esupervisionService.getCheckins(practitioner, page, size)
    const checkIns = filterCheckIns(rawCheckIns, filter)
    res.render('pages/practitioners/dashboard', { checkIns, filter, practitionerUuid: practitioner.userId })
  } catch (error) {
    next(error)
  }
}

const filterCheckIns = (checkIns: Page<Checkin>, filter: string = 'as') => {
  let filteredCheckIns

  // NOTE: the checkin status tries to capture the state of the checkin
  // in relation to the offender's "happy path", and may seem not accurate when
  // looking at it from a different perspective, e.g., why don't we mark
  // an expired checkin as REVIEWED if the practitioner has reviewed it?
  // The answer is that it would be trying to squeeze more than one dimensions
  // into a one 1D variable.

  switch (filter) {
    case 'awaiting':
      filteredCheckIns = checkIns.content.filter((checkIn: Checkin) => checkIn.status === 'CREATED')
      break
    case 'reviewed':
      filteredCheckIns = checkIns.content.filter(
        (checkIn: Checkin) => checkIn.status === 'REVIEWED' || (checkIn.status === 'EXPIRED' && checkIn.reviewedAt),
      )
      break
    default:
      filteredCheckIns = checkIns.content.filter(
        (checkIn: Checkin) => checkIn.status === 'SUBMITTED' || (checkIn.status === 'EXPIRED' && !checkIn.reviewedAt),
      )
      break
  }

  if (!filteredCheckIns || filteredCheckIns.length === 0) {
    return []
  }
  return filteredCheckIns.map((checkIn: Checkin) => {
    const { offender, autoIdCheck, dueDate, status } = checkIn
    let reviewDueDate = null
    if (checkIn.status === 'EXPIRED') {
      reviewDueDate = add(new Date(checkIn.dueDate), { days: 6 })
    } else if (checkIn.submittedAt) {
      reviewDueDate = add(new Date(checkIn.submittedAt), { days: 3 })
    }
    return {
      checkInId: checkIn.uuid,
      offenderName: `${offender.firstName} ${offender.lastName}`,
      offenderId: offender.uuid,
      sentTo: offender.email || offender.phoneNumber,
      flagged: autoIdCheck === 'NO_MATCH' || checkIn.flaggedResponses.length > 0 || checkIn.status === 'EXPIRED',
      receivedDate: checkIn.submittedAt,
      dueDate: add(new Date(dueDate), { days: 3 }),
      reviewedAt: checkIn.reviewedAt,
      reviewDueDate,
      status: friendlyCheckInStatus(status),
    }
  })
}

const friendlyCheckInStatus = (status: string) => {
  switch (status) {
    case 'CREATED':
      return 'Link sent'
    case 'SUBMITTED':
      return 'Checked in'
    case 'REVIEWED':
      return 'Checked in'
    case 'EXPIRED':
      return 'Not checked in'
    default:
      return status
  }
}

export const renderCheckInDetail: RequestHandler = async (req, res, next) => {
  try {
    const { checkInId } = req.params
    try {
      await esupervisionService.logCheckinEvent(checkInId, 'REVIEW_STARTED')
    } catch (eventError) {
      logger.warn(`Failed to send logCheckinEvent for checkin ${checkInId}`, eventError)
    }

    const { checkin: checkIn, checkinLogs } = await esupervisionService.getCheckin(checkInId)
    checkIn.dueDate = add(new Date(checkIn.dueDate), { days: 3 }).toString()
    if (checkIn.status === 'SUBMITTED') {
      checkIn.reviewDueDate = add(new Date(checkIn.submittedAt), { days: 3 }).toString()
    } else if (checkIn.status === 'EXPIRED') {
      checkIn.reviewDueDate = add(new Date(checkIn.dueDate), { days: 3 }).toString()
    }

    const missedCheckin = checkinLogs.logs.filter(log => log.logEntryType === 'OFFENDER_CHECKIN_NOT_SUBMITTED').pop()

    res.render('pages/practitioners/checkins/view', { checkIn, missedCheckin })
  } catch (error) {
    next(error)
  }
}

export const renderCheckInVideoDetail: RequestHandler = async (req, res, next) => {
  try {
    const { checkInId } = req.params
    const { checkin: checkIn, checkinLogs } = await esupervisionService.getCheckin(checkInId)
    res.render('pages/practitioners/checkins/video', { checkIn, checkinLogs })
  } catch (error) {
    next(error)
  }
}

interface CheckInFormData {
  idVerification?: string
  missedCheckinComment?: string
}

export const handleCheckInReview: RequestHandler = async (req, res, next) => {
  try {
    const { checkInId } = req.params
    const formData = res.locals.formData as CheckInFormData
    const { idVerification, missedCheckinComment } = formData
    const practitioner = res.locals.user

    const checkIn = await esupervisionService.getCheckin(checkInId)
    const name = `${checkIn.checkin.offender.firstName} ${checkIn.checkin.offender.lastName}`

    if (checkIn.checkin.status === 'EXPIRED') {
      await esupervisionService.reviewCheckin(practitioner, checkInId, null, missedCheckinComment)
      req.flash('success', { message: `You have reviewed ${name}’s missed check in` })
    } else {
      await esupervisionService.reviewCheckin(practitioner, checkInId, idVerification === 'YES')
      req.flash('success', { message: `You have reviewed ${name}’s check in` })
    }

    res.redirect(`/practitioners/dashboard`)
  } catch (error) {
    next(error)
  }
}

const getNextCheckinDate = (offender: Offender): Date | undefined => {
  const now = new Date()
  try {
    return calculateNextCheckinDate(now, parse(offender.firstCheckin, 'yyyy-MM-dd', now), offender.checkinInterval)
  } catch {
    return undefined
  }
}

export const renderCases =
  (showStopped = false): RequestHandler =>
  async (req, res, next) => {
    try {
      const practitioner = res.locals.user
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 0
      const size = req.query.size ? parseInt(req.query.size as string, 10) : 50

      const cases = await esupervisionService.getOffenders(practitioner, page, size)

      const filteredCases = cases.content.filter((offender: Offender) =>
        showStopped ? offender.status === 'INACTIVE' : offender.status !== 'INACTIVE',
      )

      const content = filteredCases.map(offender => ({
        ...offender,
        nextCheckinDate: getNextCheckinDate(offender),
      }))

      // eslint-disable-next-line prefer-destructuring
      res.locals.successMessage = req.flash('success')[0]

      res.render('pages/practitioners/cases/index', {
        cases: { content },
        practitionerUuid: practitioner.userId,
        page,
        size,
        stopped: showStopped,
      })
    } catch (error) {
      next(error)
    }
  }

export const renderCaseView: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const practitioner = res.locals.user
    const offender = await esupervisionService.getOffender(offenderId)
    if (!offender) {
      res.status(404).redirect('/practitioners/cases')
      return
    }
    let currentCheckinUuid: string | null = null
    const today = new Date()
    const latestCheckinPage = await esupervisionService.getCheckins(practitioner, 0, 1, offenderId, 'DESC')

    if (latestCheckinPage.content.length > 0) {
      const latestCheckin = latestCheckinPage.content[0]
      const expiryDate = add(parse(latestCheckin.dueDate, 'yyyy-MM-dd', new Date()), { days: 3 })

      if (latestCheckin.status === 'CREATED' && isBefore(today, expiryDate)) {
        currentCheckinUuid = latestCheckin.uuid
      }
    }

    const nextCheckinDate = getNextCheckinDate(offender)
    // eslint-disable-next-line prefer-destructuring
    res.locals.successMessage = req.flash('success')[0]
    // eslint-disable-next-line prefer-destructuring
    res.locals.infoMessage = req.flash('info')[0]
    res.render('pages/practitioners/cases/manage', {
      offenderId,
      case: offender,
      nextCheckinDate,
      currentCheckinUuid,
    })
  } catch (error) {
    next(error)
  }
}

export const renderCreateInvite: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/cases/invite', { yesterday: format(add(new Date(), { days: -1 }), 'dd/MM/yyyy') })
  } catch (error) {
    next(error)
  }
}

export const renderUpdatePersonalDetails: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    const { firstName, lastName, dateOfBirth, crn } = offender
    const data = {
      id: offenderId,
      firstName,
      lastName,
      crn,
      day: dateOfBirth ? format(new Date(dateOfBirth), 'dd') : '',
      month: dateOfBirth ? format(new Date(dateOfBirth), 'MM') : '',
      year: dateOfBirth ? format(new Date(dateOfBirth), 'yyyy') : '',
    }
    res.render('pages/practitioners/cases/update/personal-details', { offender: data })
  } catch (error) {
    next(error)
  }
}

export const renderUpdatePhoto: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    const { firstName, lastName, phoneNumber } = offender
    const data = {
      id: offenderId,
      name: `${firstName} ${lastName}`,
      contactPreference: phoneNumber ? 'TEXT' : 'EMAIL',
    }
    res.render('pages/practitioners/cases/update/photo', { offender: data })
  } catch (error) {
    next(error)
  }
}

export const renderUpdateContactDetails: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    const { firstName, lastName, phoneNumber } = offender
    const data = {
      id: offenderId,
      name: `${firstName} ${lastName}`,
      contactPreference: phoneNumber ? 'TEXT' : 'EMAIL',
    }
    res.render('pages/practitioners/cases/update/contact-details', { offender: data })
  } catch (error) {
    next(error)
  }
}

export const renderUpdateMobile: RequestHandler = async (req, res, next) => {
  try {
    res.locals.formData.email = undefined
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    res.render('pages/practitioners/cases/update/mobile', { offender })
  } catch (error) {
    next(error)
  }
}

export const renderUpdateEmail: RequestHandler = async (req, res, next) => {
  try {
    res.locals.formData.mobile = undefined
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    res.render('pages/practitioners/cases/update/email', { offender })
  } catch (error) {
    next(error)
  }
}

export const renderUpdateCheckinSettings: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    const { firstName, lastName, firstCheckin, checkinInterval } = offender
    const data = {
      id: offenderId,
      firstName,
      lastName,
      startDate: format(new Date(firstCheckin), 'dd/MM/yyyy'),
      frequency: checkinInterval,
    }
    const yesterday = format(add(new Date(), { days: -1 }), 'dd/MM/yyyy')
    const nextCheckinDate = format(
      calculateNextCheckinDate(new Date(), new Date(firstCheckin), checkinInterval),
      'dd/MM/yyyy',
    )

    res.render('pages/practitioners/cases/update/checkin-settings', { offender: data, yesterday, nextCheckinDate })
  } catch (error) {
    next(error)
  }
}

export const renderStopCheckins: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const offender = await esupervisionService.getOffender(offenderId)
    const { firstName, lastName } = offender
    const data = {
      id: offenderId,
      name: `${firstName} ${lastName}`,
    }
    res.render('pages/practitioners/cases/update/stop-checkins', { offender: data })
  } catch (error) {
    next(error)
  }
}

export const handleStopCheckins: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const practitioner = res.locals.user
    const data = req.body
    const validation = stopCheckinsSchema.safeParse(data)

    if (!validation.success) {
      const offender = await esupervisionService.getOffender(offenderId)
      const { firstName, lastName } = offender
      const offenderData = {
        id: offenderId,
        name: `${firstName} ${lastName}`,
      }
      const validationErrors = validation.error.issues.map(err => {
        return {
          text: err.message,
          href: `#${err.path.join('.')}`,
        }
      })
      return res.status(400).render('pages/practitioners/cases/update/stop-checkins', {
        data,
        validationErrors,
        offender: offenderData,
      })
    }
    const { stopCheckins, stopCheckinDetails } = validation.data
    if (stopCheckins === 'YES') {
      await esupervisionService.stopCheckins(practitioner, offenderId, stopCheckinDetails)
    }
    return res.redirect(`/practitioners/cases/${offenderId}`)
  } catch (error) {
    return next(error)
  }
}

export const handleCreateInvite: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const { dueDate } = req.body
    const parsedDate = parse(dueDate, 'd/M/yyyy', new Date())

    const data = {
      practitioner: res.locals.user.externalId(),
      offender: offenderId,
      dueDate: dueDate ? format(parsedDate, 'yyyy-MM-dd') : null,
    }
    const response = await esupervisionService.createCheckin(data)

    if (response) {
      req.flash('success', {
        message: `<strong>URL:</strong> <a href="/submission/${response.uuid}" class="govuk-notification-banner__link" target="_blank">/submission/${response.uuid}</a> <br /> <strong>Name:</strong> ${response.offender.firstName} ${response.offender.lastName} <br /><strong>Date of birth:</strong> ${format(response.offender.dateOfBirth, 'dd/MM/yyyy')}`,
      })
    }

    res.redirect(`/practitioners/cases/`)
  } catch (error) {
    next(error)
  }
}

export const handleResendInvite: RequestHandler = async (req, res, next) => {
  try {
    const { checkinId } = req.params
    const practitioner = res.locals.user
    const checkin = await esupervisionService.resendCheckinInvite(checkinId, practitioner)
    const contactMethod = checkin.offender.email || checkin.offender.phoneNumber
    req.flash('success', {
      message: `<strong>Link has been sent to ${contactMethod}</strong>`,
    })
    res.redirect(`/practitioners/cases/${checkin.offender.uuid}`)
  } catch (error) {
    next(error)
  }
}

export const renderUpdateOffender = (view: string, schema: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const schemas: Record<string, ZodIntersection | ZodObject> = {
      personal: personsDetailsSchema,
      email: emailSchema,
      mobile: mobileSchema,
      setup: updateSetUpSchema,
    }
    const selectedSchema = schemas[schema] || personsDetailsSchema
    const formData = req.body
    const validation = selectedSchema.safeParse(formData)
    if (!validation.success) {
      const { offenderId } = req.params
      const offenderDb = await esupervisionService.getOffender(offenderId)
      const validationErrors = validation.error.issues.map(err => {
        return {
          text: err.message,
          href: `#${err.path.join('.')}`,
        }
      })
      const yesterday = format(add(new Date(), { days: -1 }), 'dd/MM/yyyy')
      const nextCheckinDate = formData.startDate
      return res.status(400).render(`pages/practitioners/cases/update/${view}`, {
        offender: { ...offenderDb, ...formData },
        yesterday,
        nextCheckinDate,
        validationErrors,
      })
    }
    return next()
  }
}

export const handleUpdateOffender: RequestHandler = async (req, res, next) => {
  try {
    const offender = await esupervisionService.getOffender(req.params.offenderId)
    const { firstName, lastName, crn, day, month, year, email, mobile, startDate, frequency } = req.body

    // If contact preference changes, then need to set the previous field to null
    const updatedEmail = email ?? (mobile ? null : offender.email)
    const updatedMobile = mobile ?? (email ? null : offender.phoneNumber)

    const parseStartDate = startDate ? parse(startDate, 'd/M/yyyy', new Date()) : null

    const data: OffenderUpdate = {
      requestedBy: res.locals.user.externalId(),
      firstName: firstName || offender.firstName,
      lastName: lastName || offender.lastName,
      crn: crn || offender.crn,
      dateOfBirth: year ? format(`${year}-${month}-${day}`, 'yyyy-MM-dd') : offender.dateOfBirth,
      email: updatedEmail,
      phoneNumber: updatedMobile,
      firstCheckin: parseStartDate ? format(`${parseStartDate}`, 'yyyy-MM-dd') : offender.firstCheckin,
      checkinInterval: frequency || offender.checkinInterval,
    }

    const result = esupervisionService.updateOffender(req.params.offenderId, data)
    try {
      await result
    } catch (error) {
      if (error instanceof OffenderUpdateError) {
        if (crn) {
          return res.status(400).render('pages/practitioners/cases/update/personal-details', {
            validationErrors: [
              {
                text: 'CRN already in use',
                href: '#crn',
              },
            ],
            offender: { ...offender, firstName, lastName, day, month, year, crn },
          })
        }
        if (updatedEmail) {
          return res.status(400).render('pages/practitioners/cases/update/email', {
            validationErrors: [
              {
                text: 'Could not update contact information, email possibly in use',
                href: '#email',
              },
            ],
            offender: { ...offender, email: updatedEmail },
          })
        }
        if (updatedMobile) {
          return res.status(400).render('pages/practitioners/cases/update/mobile', {
            validationErrors: [
              {
                text: 'Could not update contact information, mobile number possibly in use',
                href: '#mobile',
              },
            ],
            offender: { ...offender, phoneNumber: updatedMobile },
          })
        }
      }
      throw error
    }

    req.flash('success', {
      title: `Changes have been updated successfully`,
    })
    return res.redirect(`/practitioners/cases/${req.params.offenderId}`)
  } catch (error) {
    return next(error)
  }
}

// REGISTER POP ROUTES

export const handleStartRegister: RequestHandler = async (req, res, next) => {
  req.session.formData = {
    startedAt: new Date().toISOString(),
  }
  res.redirect(`/practitioners/register?start=true`)
}

export const renderRegisterDetails: RequestHandler = async (req, res, next) => {
  try {
    // `cya` value determines the back link
    const cya = req.query.checkAnswers === 'true'
    // `start` value determines if the form is in start mode and will add JS to clear any data in local storage
    const start = req.query.start === 'true'
    res.render('pages/practitioners/register/index', { cya, start })
  } catch (error) {
    next(error)
  }
}

export const renderPhotoCapture: RequestHandler = async (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/register/photo/index', { cya })
  } catch (error) {
    next(error)
  }
}

export const renderPhotoUpload: RequestHandler = async (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/register/photo/upload', { cya })
  } catch (error) {
    next(error)
  }
}

export const handlePhotoPost: RequestHandler = async (req, res, next) => {
  const { checkYourAnswers } = req.body
  return res.redirect(`/practitioners/register/photo/review${checkYourAnswers === 'true' ? '?checkAnswers=true' : ''}`)
}

export const renderPhotoReview: RequestHandler = async (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/register/photo/review', { cya })
  } catch (error) {
    next(error)
  }
}

export const renderContactDetails: RequestHandler = async (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/register/contact/index', { cya })
  } catch (error) {
    next(error)
  }
}

export const handleContactPreferences: RequestHandler = async (req, res, next) => {
  const { contactPreference, checkYourAnswers } = req.body

  if (contactPreference === 'EMAIL') {
    return res.redirect(
      `/practitioners/register/contact/email${checkYourAnswers === 'true' ? '?checkAnswers=true' : ''}`,
    )
  }

  return res.redirect(
    `/practitioners/register/contact/mobile${checkYourAnswers === 'true' ? '?checkAnswers=true' : ''}`,
  )
}

export const renderMobile: RequestHandler = async (req, res, next) => {
  try {
    req.session.formData.email = undefined
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/register/contact/mobile', { cya })
  } catch (error) {
    next(error)
  }
}

export const renderEmail: RequestHandler = async (req, res, next) => {
  try {
    req.session.formData.mobile = undefined
    const cya = req.query.checkAnswers === 'true'
    res.render('pages/practitioners/register/contact/email', { cya })
  } catch (error) {
    next(error)
  }
}

export const handleCheckIfContactDetailsExist: (type: 'email' | 'phone_number') => RequestHandler = (
  type,
): RequestHandler => {
  return async (req, res, next) => {
    const contactDetail = type === 'phone_number' ? req.body.mobile : req.body.email
    const data: OffenderInfoByContact = {
      practitioner: res.locals.user.externalId(),
      [type]: contactDetail,
    }
    try {
      const existingRecords: Page<Offender> = await esupervisionService.getOffenderByContactDetail(data)
      if (existingRecords.content.length === 0) {
        next()
      } else {
        const validationErrors = [
          {
            text: `The ${type === 'phone_number' ? 'phone number' : 'email address'} you have entered is already being used to check in`,
            href: `#${type === 'phone_number' ? 'mobile' : 'email'}`,
          },
        ]
        res.render(`pages/practitioners/register/contact/${type === 'phone_number' ? 'mobile' : 'email'}`, {
          validationErrors,
        })
      }
    } catch (error) {
      next(error)
    }
  }
}

export const renderSetUp: RequestHandler = async (req, res, next) => {
  try {
    const cya = req.query.checkAnswers === 'true'
    const yesterday = format(add(new Date(), { days: -1 }), 'dd/MM/yyyy')
    res.render('pages/practitioners/register/set-up', { cya, yesterday })
  } catch (error) {
    next(error)
  }
}

export const validateRegisterPoPData: RequestHandler = (req, res, next) => {
  const parsed = OffenderInfoInput.safeParse(res.locals.formData)
  if (!parsed.success) {
    logger.info('Rendering CYA but has invalid data - would normally redirect')
  }
  next()
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
    const { day, month, year, contactPreference, frequency } = res.locals.formData
    if (year) {
      res.locals.dateOfBirth = new Date(`${year}/${month}/${day}`)
    }
    res.locals.contactPreference = getUserFriendlyString(contactPreference?.toString())
    res.locals.frequency = getUserFriendlyString(frequency?.toString() || 'WEEKLY')

    res.render('pages/practitioners/register/check-answers')
  } catch (error) {
    next(error)
  }
}

export const handleRegisterBegin: RequestHandler = async (req, res, next) => {
  const parsed = OffenderInfoInput.safeParse(res.locals.formData)
  if (!parsed.success) {
    res.status(400).json({ status: 'ERROR', message: 'Invalid data', details: parsed.error.message })
    return
  }

  const { firstName, lastName, day, month, year, crn, contactPreference, email, mobile, frequency, startedAt } =
    parsed.data
  const { startDate } = parsed.data
  const firstCheckinDate = parse(startDate, 'd/M/yyyy', new Date())

  const data = {
    setupUuid: uuidv4(),
    practitionerId: res.locals.user.externalId(),
    firstName,
    lastName,
    dateOfBirth: year ? format(`${year}-${month}-${day}`, 'yyyy-MM-dd') : null,
    crn,
    email: contactPreference === 'EMAIL' && email ? email : null,
    phoneNumber: contactPreference === 'TEXT' && mobile ? mobile : null,
    firstCheckinDate: format(firstCheckinDate, 'yyyy-MM-dd'),
    checkinInterval: frequency as CheckinInterval,
    startedAt,
  }

  try {
    const setup = await esupervisionService.createOffender(data)
    const uploadLocation = await esupervisionService.getProfilePhotoUploadLocation(setup, 'image/jpeg')
    logger.info('Registration started', setup)
    res.json({ status: 'SUCCESS', message: 'Registration complete', setup, uploadLocation })
  } catch (error) {
    const statusCode = error?.data?.status || 500
    res.status(statusCode).json({ status: 'ERROR', message: error?.data?.userMessage || error.message })
  }
}

export const handleRegisterComplete: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, contactPreference, email, mobile } = res.locals.formData
  req.session.formData = {}
  try {
    // Complete PoP registration
    const registerResponse = await esupervisionService.completeOffenderSetup(req.body.setupId)

    if (registerResponse) {
      const name = `${firstName} ${lastName}`
      const contactInfo = contactPreference === 'EMAIL' ? email : mobile
      // set flash message
      req.flash('success', {
        title: `${name} has been set up to check in online`,
        message: `We have sent a confirmation to ${contactInfo}`,
      })
      // redirect to dashboard
      res.redirect('/practitioners/dashboard')
    }
  } catch (error) {
    next(error)
  }
}

export const renderUserInfo: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/data/user')
  } catch (error) {
    next(error)
  }
}

export const handleGetUserInfo: RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.body
    const practitioner = await esupervisionService.getPractitionerByUsername(username)
    res.render('pages/practitioners/data/user', { practitioner })
  } catch (error) {
    next(error)
  }
}
