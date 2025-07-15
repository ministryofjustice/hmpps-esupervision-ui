import { RequestHandler } from 'express'
import { format } from 'date-fns/format'
import { v4 as uuidv4 } from 'uuid'
import { services } from '../services'
import Checkin from '../data/models/checkin'
import Page from '../data/models/page'
import getUserFriendlyString from '../utils/userFriendlyStrings'

const { esupervisionService } = services()

export const handleRedirect = (url: string): RequestHandler => {
  let redirectUrl = url
  return (req, res) => {
    if (req.query.checkAnswers === 'true') {
      redirectUrl = '/practitioners/register/check-answers'
    }
    res.redirect(redirectUrl)
  }
}

export const renderDashboard: RequestHandler = async (req, res, next) => {
  try {
    const practitionerUuid = res.locals.user.userId
    const rawCheckIns = await esupervisionService.getCheckins(practitionerUuid)
    const checkIns = filterCheckIns(rawCheckIns)
    res.render('pages/practitioners/dashboard', { checkIns, practitionerUuid })
  } catch (error) {
    next(error)
  }
}

export const renderDashboardFiltered: RequestHandler = async (req, res, next) => {
  try {
    const { filter } = req.params
    const practitionerUuid = res.locals.user.userId
    const rawCheckIns = await esupervisionService.getCheckins(practitionerUuid)
    const checkIns = filterCheckIns(rawCheckIns)
    res.render('pages/practitioners/dashboard', { checkIns, filter, practitionerUuid })
  } catch (error) {
    next(error)
  }
}

const filterCheckIns = (checkIns: Page<Checkin>) => {
  return checkIns.content.map((checkIn: Checkin) => {
    const { offender, autoIdCheck, dueDate, status } = checkIn
    return {
      checkInId: checkIn.uuid,
      offenderName: `${offender.firstName} ${offender.lastName}`,
      offenderId: offender.uuid,
      flagged: autoIdCheck === 'NO_MATCH' || checkIn.flaggedResponses.length > 0,
      receivedDate: checkIn.submittedOn ? format(new Date(checkIn.submittedOn), 'dd/MM/yyyy') : '',
      dueDate: format(new Date(dueDate), 'dd/MM/yyyy'),
      status: friendlyCheckInStatus(status),
    }
  })
}

const friendlyCheckInStatus = (status: string) => {
  switch (status) {
    case 'CREATED':
      return 'Not submitted'
    case 'SUBMITTED':
      return 'Received'
    case 'REVIEWED':
      return 'Reviewed'
    default:
      return status
  }
}

export const renderCheckInDetail: RequestHandler = async (req, res, next) => {
  try {
    const { checkInId } = req.params
    const checkIn = await esupervisionService.getCheckin(checkInId)
    res.render('pages/practitioners/checkins/view', { checkIn })
  } catch (error) {
    next(error)
  }
}

export const renderCases: RequestHandler = async (req, res, next) => {
  try {
    const practitionerUuid = res.locals.user.userId
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 20

    const cases = await esupervisionService.getOffenders(practitionerUuid, page, size)
    // eslint-disable-next-line prefer-destructuring
    res.locals.successMessage = req.flash('success')[0]
    res.render('pages/practitioners/cases/index', { cases, practitionerUuid, page, size })
  } catch (error) {
    next(error)
  }
}

export const renderCaseView: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/cases/view')
  } catch (error) {
    next(error)
  }
}

export const renderCreateInvite: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/cases/invite')
  } catch (error) {
    next(error)
  }
}

export const handleCreateInvite: RequestHandler = async (req, res, next) => {
  try {
    const { offenderId } = req.params
    const { dueDate } = req.body

    const data = {
      practitioner: res.locals.user.userId,
      offender: offenderId,
      dueDate,
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

export const renderUsers: RequestHandler = async (req, res, next) => {
  try {
    // eslint-disable-next-line prefer-destructuring
    res.locals.successMessage = req.flash('success')[0]
    res.render('pages/practitioners/users/index')
  } catch (error) {
    next(error)
  }
}

export const renderUserCreate: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/users/create')
  } catch (error) {
    next(error)
  }
}

export const handleCreateUser: RequestHandler = async (req, res, next) => {
  try {
    const { uuid, firstName, lastName, email, mobile } = res.locals.formData
    const data = {
      uuid: uuid.toString() || '',
      firstName: firstName.toString() || '',
      lastName: lastName.toString() || '',
      email: email ? email.toString() : null,
      phoneNumber: mobile ? mobile.toString() : null,
      roles: ['ROLE_PRACTITIONER'],
    }
    await esupervisionService.createPractitioner(data)
    req.flash('success', { message: 'Practitioner created successfully' })
    res.redirect('/practitioners/users')
  } catch (error) {
    next(error)
  }
}

export const handleStartRegister: RequestHandler = async (req, res, next) => {
  req.session.formData = {}
  res.redirect(`/practitioners/register`)
}

export const renderRegisterDetails: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/index')
  } catch (error) {
    next(error)
  }
}

export const renderPhotoCapture: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/photo/index')
  } catch (error) {
    next(error)
  }
}

export const renderPhotoReview: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/photo/review')
  } catch (error) {
    next(error)
  }
}

export const renderContactDetails: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/contact/index')
  } catch (error) {
    next(error)
  }
}

export const handleContactPreferences: RequestHandler = async (req, res, next) => {
  const { contactPreference } = req.body

  if (contactPreference === 'EMAIL') {
    return res.redirect('/practitioners/register/contact/email')
  }

  return res.redirect('/practitioners/register/contact/mobile')
}

export const renderMobile: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/contact/mobile')
  } catch (error) {
    next(error)
  }
}

export const handleMobile: RequestHandler = async (req, res, next) => {
  const { contactPreference } = res.locals.formData

  if (contactPreference === 'BOTH') {
    return res.redirect('/practitioners/register/contact/email')
  }

  return res.redirect('/practitioners/register/set-up')
}

export const renderEmail: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/contact/email')
  } catch (error) {
    next(error)
  }
}

export const renderSetUp: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/set-up')
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
    const { day, month, year, contactPreference, startDateDay, startDateMonth, startDateYear, frequency } =
      res.locals.formData

    res.locals.dateOfBirth = new Date(`${year}/${month}/${day}`)
    res.locals.contactPreference = getUserFriendlyString(contactPreference?.toString())

    if (startDateYear) {
      res.locals.startDate = new Date(`${startDateYear}/${startDateMonth}/${startDateDay}`)
    }

    res.locals.frequency = getUserFriendlyString(frequency.toString())

    res.render('pages/practitioners/register/check-answers')
  } catch (error) {
    next(error)
  }
}

const dataUrlToBlob = (dataUrl: string) => {
  const [info, data] = dataUrl.split(',')
  const mime = info.match(/:(.*?);/)[1]
  const byteString = atob(data)
  const bytes = new Uint8Array(byteString.length)

  for (let i = 0; i < byteString.length; i += 1) {
    bytes[i] = byteString.charCodeAt(i)
  }

  return new Blob([bytes], { type: mime })
}

export const handleRegister: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, day, month, year, email, mobile, photoData } = res.locals.formData

  const data = {
    setupUuid: uuidv4(),
    practitionerId: res.locals.user.userId,
    firstName: firstName.toString() || '',
    lastName: lastName.toString() || '',
    dateOfBirth: format(`${year}-${month}-${day}`, 'yyyy-MM-dd'),
    email: email ? email.toString() : null,
    phoneNumber: mobile ? mobile.toString() : null,
  }

  try {
    // convert photo data URL to blob
    const photoBlob = dataUrlToBlob(photoData as string)

    // create PoP record
    const setup = await esupervisionService.createOffender(data)

    // get upload location for PoP photo from the API
    const uploadLocation = await esupervisionService.getProfilePhotoUploadLocation(setup, photoBlob.type)

    // upload PoP photo to location URL
    const response = await fetch(uploadLocation.url, {
      method: 'PUT',
      body: photoBlob,
      headers: {
        'Content-Type': photoBlob.type,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to upload profile image')
    }

    // complete PoP registration
    await esupervisionService.completeOffenderSetup(setup)
  } catch (error) {
    next(error)
  }
  return res.redirect('/practitioners/register/confirmation')
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    const { startDateDay, startDateMonth, startDateYear } = res.locals.formData
    const startDate = new Date(`${startDateYear}/${startDateMonth}/${startDateDay}`)
    const contactPreference = res.locals.formData.contactPreference || 'email'
    const contactString =
      contactPreference === 'BOTH'
        ? `${res.locals.formData.email} and ${res.locals.formData.mobile}`
        : res.locals.formData[contactPreference.toString()]

    res.render('pages/practitioners/register/confirmation', { startDate, contactString })
    req.session.formData = {}
  } catch (error) {
    next(error)
  }
}
