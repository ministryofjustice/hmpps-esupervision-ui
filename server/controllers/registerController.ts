import { RequestHandler } from 'express'

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
