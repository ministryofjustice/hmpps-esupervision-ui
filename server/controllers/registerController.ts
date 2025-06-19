import { RequestHandler } from 'express'
import userFriendlyStrings from '../utils/userFriendlyStrings'

export const handleStart: RequestHandler = async (req, res, next) => {
  req.session.formData = {}
  res.redirect('/register/personal-details')
}

export const handleRedirect = (url: string): RequestHandler => {
  let redirectUrl = url
  return (req, res) => {
    if (req.query.checkAnswers === 'true') {
      redirectUrl = '/register/check-your-answers'
    }
    res.redirect(redirectUrl)
  }
}

export const renderIndex: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/index')
  } catch (error) {
    next(error)
  }
}

export const renderPersonalDetails: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/personal-details')
  } catch (error) {
    next(error)
  }
}

export const renderPhotoInform: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/photo/inform')
  } catch (error) {
    next(error)
  }
}

export const renderPhotoCapture: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/photo/capture')
  } catch (error) {
    next(error)
  }
}

export const renderPhotoReview: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/photo/review')
  } catch (error) {
    next(error)
  }
}

export const handlePhotoReview: RequestHandler = async (req, res, next) => {
  const { photoMeetsRules } = req.body
  if (photoMeetsRules === 'no') {
    req.session.formData.photoMeetsRules = null
    return res.redirect('/register/photo/capture')
  }
  return res.redirect('/register/contact-details')
}

export const renderContactDetails: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/contact-details/preference')
  } catch (error) {
    next(error)
  }
}

export const handleContactPreferences: RequestHandler = async (req, res, next) => {
  const { contactPreference } = req.body

  if (contactPreference === 'email') {
    return res.redirect('/register/contact-details/email')
  }

  return res.redirect('/register/contact-details/mobile')
}

export const renderMobile: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/contact-details/mobile')
  } catch (error) {
    next(error)
  }
}

export const handleMobile: RequestHandler = async (req, res, next) => {
  const { contactPreference } = res.locals.formData

  if (contactPreference === 'both') {
    return res.redirect('/register/contact-details/email')
  }

  return res.redirect('/register/check-your-answers')
}

export const renderEmail: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/contact-details/email')
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
    const { day, month, year, contactPreference } = res.locals.formData

    res.locals.dateOfBirth = `${day}/${month}/${year}`
    res.locals.contactPreference = userFriendlyStrings(contactPreference?.toString())

    res.render('pages/register/check-answers')
  } catch (error) {
    next(error)
  }
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/confirmation')
  } catch (error) {
    next(error)
  }
}
