import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validateFormData from '../middleware/validateFormData'
import {
  handleStart,
  handleRedirect,
  handleVerify,
  renderAssistance,
  renderCheckAnswers,
  renderConfirmation,
  renderIndex,
  renderQuestionsCallback,
  renderVerify,
  renderVideoInform,
  renderVideoRecord,
  renderVideoReview,
} from '../controllers/submissionController'

import {
  personalDetailsSchema,
  assistanceSchema,
  callbackSchema,
  checkAnswersSchema,
} from '../schemas/submissionSchemas'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  router.post('/start', handleStart)

  get('/', renderIndex)
  get('/verify', renderVerify)
  router.post('/verify', validateFormData(personalDetailsSchema), handleVerify)

  get('/questions/assistance', renderAssistance)
  router.post(
    '/questions/assistance',
    validateFormData(assistanceSchema),
    handleRedirect('/submission/questions/callback'),
  )

  get('/questions/callback', renderQuestionsCallback)
  router.post('/questions/callback', validateFormData(callbackSchema), (req, res) => {
    res.redirect('/submission/video/inform')
  })

  get('/video/inform', renderVideoInform)
  get('/video/record', renderVideoRecord)
  get('/video/review', renderVideoReview)

  get('/check-your-answers', renderCheckAnswers)
  router.post('/check-your-answers', validateFormData(checkAnswersSchema), (req, res) => {
    // API call to save submission data would go here
    // For now, we just redirect to confirmation
    res.redirect('/submission/confirmation')
  })

  get('/confirmation', renderConfirmation)

  return router
}
