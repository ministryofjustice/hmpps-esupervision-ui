import { RequestHandler } from 'express'

const protectSubmission: RequestHandler = (req, res, next) => {
  const { submissionAuthorized } = req.session
  if (!submissionAuthorized) {
    return res.redirect('/practitioners/submission/timeout')
  }
  res.locals.submissionAuthorized = submissionAuthorized
  console.log('Submission authorized...', submissionAuthorized)
  return next()
}

export default protectSubmission
