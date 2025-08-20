import { RequestHandler } from 'express'
import config from '../config'

const protectSubmission: RequestHandler = (req, res, next) => {
  const sessionStart = req.session.submissionAuthorized
  const sessionTimeout = config.session.ofenderSessionTimeoutMinutes * 60 * 1000
  if (!sessionStart || Date.now() - sessionStart > sessionTimeout) {
    const { submissionId } = req.params

    req.session.submissionAuthorized = undefined
    req.session.formData = undefined

    return res.render('pages/submission/timeout', { checkinUrl: `/submission/${submissionId}/verify` })
  }
  return next()
}

export default protectSubmission
