import { RequestHandler } from 'express'

const protectSubmission: RequestHandler = (req, res, next) => {
  const { submissionAuthorized } = req.session
  if (!submissionAuthorized) {
    const { submissionId } = req.params
    return res.render('pages/submission/timeout', { submissionId })
  }
  res.locals.submissionAuthorized = submissionAuthorized
  return next()
}

export default protectSubmission
