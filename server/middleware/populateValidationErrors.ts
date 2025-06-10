import { Request, Response, NextFunction, RequestHandler } from 'express'

export default function populateValidationErrors(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = req.flash('validationErrors')[0]
    if (validationErrors) {
      res.locals.validationErrors = JSON.parse(validationErrors)
    }
    next()
  }
}
