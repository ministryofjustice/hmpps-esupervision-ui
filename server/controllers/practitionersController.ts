import { RequestHandler } from 'express'

export const renderDashboard: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/practitioners/dashboard')
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
