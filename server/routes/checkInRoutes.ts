import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
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
} from '../controllers/checkInController'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderIndex)
  get('/verify', renderVerify)

  get('/video/inform', renderVideoInform)
  get('/video/record', renderVideoRecord)
  get('/video/review', renderVideoReview)

  get('/questions/circumstances', renderQuestionsCircumstances)
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
