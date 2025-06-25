import { RequestHandler } from 'express'
import { format } from 'date-fns/format'
import { v4 as uuidv4 } from 'uuid'
import userFriendlyStrings from '../utils/userFriendlyStrings'
import { services } from '../services'

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
    const checkIns = await esupervisionService.getCheckins(practitionerUuid)
    res.render('pages/practitioners/dashboard', { checkIns, practitionerUuid })
  } catch (error) {
    next(error)
  }
}

export const renderDashboardFiltered: RequestHandler = async (req, res, next) => {
  try {
    const { filter } = req.params
    const practitionerUuid = res.locals.user.userId
    const checkIns = await esupervisionService.getCheckins(practitionerUuid)
    res.render('pages/practitioners/dashboard', { checkIns, filter })
  } catch (error) {
    next(error)
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

  if (contactPreference === 'email') {
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

  if (contactPreference === 'both') {
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
    const { day, month, year, contactPreference, startDateDay, startDateMonth, startDateYear } = res.locals.formData

    res.locals.dateOfBirth = `${day}/${month}/${year}`
    res.locals.contactPreference = userFriendlyStrings(contactPreference?.toString())

    if (startDateYear) {
      const startDate = new Date(`${startDateYear}/${startDateMonth}/${startDateDay}`)
      res.locals.startDate = format(startDate, 'do MMMM yyyy')
    }

    res.render('pages/practitioners/register/check-answers')
  } catch (error) {
    next(error)
  }
}

export const handleRegister: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, day, month, year, email, mobile } = res.locals.formData

  const data = {
    setupUuid: uuidv4(),
    practitionerId: res.locals.user.userId,
    firstName: firstName.toString() || '',
    lastName: lastName.toString() || '',
    dateOfBirth: `${year}-${month}-${day}`,
    email: email ? email.toString() : null,
    phoneNumber: mobile ? mobile.toString() : null,
  }
  try {
    await esupervisionService.createOffender(data)
  } catch (error) {
    next(error)
  }
  return res.redirect('/practitioners/register/confirmation')
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    const { startDateDay, startDateMonth, startDateYear } = res.locals.formData
    const startDate = new Date(`${startDateYear}/${startDateMonth}/${startDateDay}`)
    res.render('pages/practitioners/register/confirmation', { startDate })
    req.session.formData = {}
  } catch (error) {
    next(error)
  }
}
