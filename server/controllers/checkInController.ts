import { RequestHandler } from 'express'
import { format } from 'date-fns'

export const renderIndex: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/index')
  } catch (error) {
    next(error)
  }
}

export const renderVerify: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/verify')
  } catch (error) {
    next(error)
  }
}

export const renderVideoInform: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/video/inform')
  } catch (error) {
    next(error)
  }
}

export const renderVideoRecord: RequestHandler = async (req, res, next) => {
  try {
    const now = new Date()
    const todayDay = format(now, 'EEEE')
    const todayDate = format(now, 'do MMMM yyyy')

    res.render('pages/check-in/video/record', { todayDate, todayDay })
  } catch (error) {
    next(error)
  }
}

export const renderVideoReview: RequestHandler = async (req, res, next) => {
  try {
    const now = new Date()
    const todayDay = format(now, 'EEEE')
    const todayDate = format(now, 'do MMMM yyyy')
    res.render('pages/check-in/video/review', { todayDate, todayDay })
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsCircumstances: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/circumstances')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsPoliceContact: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/police-contact')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsAlcohol: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/alcohol')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsDrugs: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/drugs')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsPhysicalHealth: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/physical-health')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsMentalHealth: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/mental-health')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsCallback: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/questions/callback')
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/check-answers')
  } catch (error) {
    next(error)
  }
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/check-in/confirmation')
  } catch (error) {
    next(error)
  }
}
