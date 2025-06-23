import { RequestHandler } from 'express'
import { format } from 'date-fns/format'
import { services } from '../services'
import userFriendlyStrings from '../utils/userFriendlyStrings'

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
    const time = await esupervisionService.getCurrentTime()
    res.render('pages/practitioners/dashboard', { time })
  } catch (error) {
    next(error)
  }
}

export const renderCheckInDetail: RequestHandler = async (req, res, next) => {
  try {
    const { checkInId } = req.params
    res.render('pages/practitioners/checkins/view', { checkInId })
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

  return res.redirect('/practitioners/register/start-date')
}

export const renderEmail: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/contact/email')
  } catch (error) {
    next(error)
  }
}

export const renderStartDate: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/start-date')
  } catch (error) {
    next(error)
  }
}

export const renderFrequency: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/register/frequency')
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
  return res.redirect('/practitioners/dashboard')
}
