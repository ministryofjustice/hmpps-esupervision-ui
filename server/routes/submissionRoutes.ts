import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validateFormData from '../middleware/validateFormData'
import {
  renderCheckAnswers,
  renderConfirmation,
  renderIndex,
  renderQuestionsAlcohol,
  renderQuestionsCallback,
  renderQuestionsCircumstances,
  renderQuestionsDrugs,
  renderQuestionsMentalHealth,
  renderQuestionsPhysicalHealth,
  renderQuestionsPoliceContact,
  renderVerify,
  renderVideoInform,
  renderVideoRecord,
  renderVideoReview,
} from '../controllers/submissionController'

import { personalDetailsSchema, videoReviewSchema, circumstancesSchema } from '../schemas/submissionSchemas'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderIndex)
  get('/verify', renderVerify)
  router.post('/verify', validateFormData(personalDetailsSchema), renderVideoInform)

  get('/video/inform', renderVideoInform)
  get('/video/record', renderVideoRecord)
  get('/video/review', renderVideoReview)
  router.post('/video/review', validateFormData(videoReviewSchema), (req, res) => {
    res.redirect('/submission/questions/circumstances')
  })

  get('/questions/circumstances', renderQuestionsCircumstances)
  router.post('/questions/circumstances', validateFormData(circumstancesSchema), (req, res) => {
    res.redirect('/submission/questions/police-contact')
  })

  get('/questions/police-contact', renderQuestionsPoliceContact)
  get('/questions/alcohol', renderQuestionsAlcohol)
  get('/questions/drugs', renderQuestionsDrugs)
  get('/questions/physical-health', renderQuestionsPhysicalHealth)
  get('/questions/mental-health', renderQuestionsMentalHealth)
  get('/questions/callback', renderQuestionsCallback)

  get('/check-your-answers', renderCheckAnswers)
  get('/confirmation', renderConfirmation)

  return router
}
