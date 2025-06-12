import { RequestHandler } from 'express'
import { format } from 'date-fns'

export const renderIndex: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/index')
  } catch (error) {
    next(error)
  }
}

export const renderVerify: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/verify')
  } catch (error) {
    next(error)
  }
}

export const handleVerify: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, day, month, year } = req.body
  const dateOfBirth = `${day}/${month}/${year}`

  // Check if details match
  if (firstName === 'John') {
    return res.render('pages/submission/no-match-found', { firstName, lastName, dateOfBirth })
  }

  return res.redirect('/submission/video/inform')
}

export const renderVideoInform: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/video/inform')
  } catch (error) {
    next(error)
  }
}

export const renderVideoRecord: RequestHandler = async (req, res, next) => {
  try {
    const now = new Date()
    const todayDay = format(now, 'EEEE')
    const todayDate = format(now, 'do MMMM yyyy')

    res.render('pages/submission/video/record', { todayDate, todayDay })
  } catch (error) {
    next(error)
  }
}

export const renderVideoReview: RequestHandler = async (req, res, next) => {
  try {
    const now = new Date()
    const todayDay = format(now, 'EEEE')
    const todayDate = format(now, 'do MMMM yyyy')
    res.render('pages/submission/video/review', { todayDate, todayDay })
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsCircumstances: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/circumstances')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsPoliceContact: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/police-contact')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsAlcohol: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/alcohol')
  } catch (error) {
    next(error)
  }
}

export const handleAlcohol: RequestHandler = async (req, res, next) => {
  const { alcoholUse } = req.body

  if (alcoholUse === 'no') {
    return res.redirect('/submission/questions/drugs')
  }

  return res.redirect('/submission/questions/alcohol-units')
}

export const renderQuestionsAlcoholUnits: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/alcohol-units')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsDrugs: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/drugs')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsPhysicalHealth: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/physical-health')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsMentalHealth: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/mental-health')
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsCallback: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/callback')
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/check-answers')
  } catch (error) {
    next(error)
  }
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/confirmation')
  } catch (error) {
    next(error)
  }
}
