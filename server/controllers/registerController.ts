import { RequestHandler } from 'express'

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

export const handlePersonalDetails: RequestHandler = async (req, res, next) => {
  return res.redirect('/register/photo/inform')
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

export const renderContactDetails: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/register/contact-details/preference')
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
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
