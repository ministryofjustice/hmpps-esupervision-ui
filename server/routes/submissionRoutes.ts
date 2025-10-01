import { type RequestHandler, Router } from 'express'
import protectSubmission from '../middleware/submissionMiddleware'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validateFormData from '../middleware/validateFormData'
import {
  handleStart,
  handleRedirect,
  handleVerify,
  handleSubmission,
  handleVideoVerify,
  renderAssistance,
  renderQuestionsMentalHealth,
  renderCheckAnswers,
  renderConfirmation,
  renderIndex,
  renderQuestionsCallback,
  renderVerify,
  renderVideoInform,
  renderVideoRecord,
  renderViewVideo,
  handleAssistance,
} from '../controllers/submissionController'

import {
  personalDetailsSchema,
  mentalHealthSchema,
  assistanceSchema,
  callbackSchema,
  checkAnswersSchema,
} from '../schemas/submissionSchemas'

import { Services } from '../services'
import logger from '../../logger'

export default function routes({ esupervisionService }: Services): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], ...handlers: RequestHandler[]) =>
    router.get(routePath, ...handlers.map(handler => asyncMiddleware(handler)))

  // all submission routes require a valid submission
  // fetch from the API and return a 404 if the submission doesn't exist
  router.use(
    asyncMiddleware(async (req, res, next) => {
      const { submissionId } = req.params
      const notFound = () => {
        res.render('pages/submission/not-found')
      }
      const expired = () => {
        res.render('pages/submission/expired')
      }

      if (submissionId) {
        // lookup submission from the API
        try {
          const checkinResponse = await esupervisionService.getCheckin(submissionId, true)
          if (checkinResponse.checkin.status === 'SUBMITTED' && req.originalUrl.endsWith('/confirmation')) {
            next()
          } else if (checkinResponse.checkin.status === 'EXPIRED') {
            expired()
          } else if (checkinResponse.checkin.status !== 'CREATED') {
            notFound()
          } else {
            res.locals.submission = checkinResponse
            next()
          }
        } catch (err) {
          if (err.responseStatus === 404) {
            notFound()
          } else {
            throw err
          }
        }
      } else {
        notFound()
      }
    }),
  )

  router.post('/start', handleStart)

  get('/', renderIndex)
  get('/verify', renderVerify)
  router.post('/verify', validateFormData(personalDetailsSchema), handleVerify)

  get('/questions/mental-health', protectSubmission, renderQuestionsMentalHealth)
  router.post('/questions/mental-health', validateFormData(mentalHealthSchema), handleRedirect('/questions/assistance'))

  get('/questions/assistance', protectSubmission, renderAssistance)
  router.post('/questions/assistance', protectSubmission, validateFormData(assistanceSchema), handleAssistance)

  get('/questions/callback', protectSubmission, renderQuestionsCallback)
  router.post(
    '/questions/callback',
    protectSubmission,
    validateFormData(callbackSchema),
    handleRedirect('/video/inform'),
  )

  get('/video/inform', protectSubmission, renderVideoInform)
  get('/video/record', protectSubmission, renderVideoRecord)
  get('/video/verify', protectSubmission, handleVideoVerify)
  get('/video/view', protectSubmission, renderViewVideo)

  get('/check-your-answers', protectSubmission, renderCheckAnswers)
  router.post('/check-your-answers', protectSubmission, validateFormData(checkAnswersSchema), handleSubmission)

  get('/confirmation', renderConfirmation)

  // Session management routes

  // Timeout route to handle session expiration
  get('/timeout', (req, res) => {
    const { submissionId } = req.params
    logger.info(`User session timed out for submissionId ${submissionId}`)
    req.session.submissionAuthorized = null
    res.render('pages/submission/timeout', { submissionId })
  })

  // Keepalive route for session management
  get('/keepalive', (req, res) => {
    res.json({ status: 'OK' })
  })

  return router
}
