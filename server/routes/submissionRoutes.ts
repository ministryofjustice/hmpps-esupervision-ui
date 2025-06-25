import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validateFormData from '../middleware/validateFormData'
import {
  handleStart,
  handleRedirect,
  handleVerify,
  handleSubmission,
  renderAssistance,
  renderQuestionsMentalHealth,
  renderCheckAnswers,
  renderConfirmation,
  renderIndex,
  renderQuestionsCallback,
  renderVerify,
  renderVideoInform,
  renderVideoRecord,
  renderVideoReview,
  handleVideoPost,
} from '../controllers/submissionController'

import {
  personalDetailsSchema,
  mentalHealthSchema,
  assistanceSchema,
  callbackSchema,
  checkAnswersSchema,
} from '../schemas/submissionSchemas'

import { Services } from '../services'

export default function routes({ esupervisionService }: Services): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  // all submission routes require a valid submission
  // fetch from the API and return a 404 if the submission doesn't exist
  router.use(
    asyncMiddleware(async (req, res, next) => {
      const { submissionId } = req.params
      const notFound = () => {
        res.render('pages/submission/not-found')
      }

      if (submissionId) {
        // lookup submission from the API
        try {
          res.locals.submission = await esupervisionService.getCheckin(submissionId)
          next()
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

  get('/questions/mental-health', renderQuestionsMentalHealth)
  router.post('/questions/mental-health', validateFormData(mentalHealthSchema), handleRedirect('/questions/assistance'))

  get('/questions/assistance', renderAssistance)
  router.post('/questions/assistance', validateFormData(assistanceSchema), handleRedirect('/questions/callback'))

  get('/questions/callback', renderQuestionsCallback)
  router.post('/questions/callback', validateFormData(callbackSchema), handleRedirect('/video/inform'))

  get('/video/inform', renderVideoInform)
  get('/video/record', renderVideoRecord)
  router.post('/video/record', handleVideoPost)

  get('/video/review', renderVideoReview)

  get('/check-your-answers', renderCheckAnswers)
  router.post('/check-your-answers', validateFormData(checkAnswersSchema), handleSubmission)

  get('/confirmation', renderConfirmation)

  return router
}
