import { RequestHandler } from 'express'
import config from '../config'

const protectSubmission: RequestHandler = (req, res, next) => {
  const sessionStart = req.session.submissionAuthorized
  const sessionTimeout = config.session.ofenderSessionTimeoutMinutes * 60 * 1000
  if (!sessionStart || Date.now() - sessionStart > sessionTimeout) {
    const { submissionId } = req.params

    req.session.submissionAuthorized = undefined
    req.session.formData.firstName = undefined
    req.session.formData.lastName = undefined
    req.session.formData.day = undefined
    req.session.formData.month = undefined
    req.session.formData.year = undefined

    req.flash('error', { title: 'Your session has expired. Please start again.' })
    return res.redirect(`/submission/${submissionId}/verify`)
  }
  return next()
}

export default protectSubmission
