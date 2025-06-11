import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validateFormData from '../middleware/validateFormData'
import {
  handleVerify,
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

import {
  personalDetailsSchema,
  videoReviewSchema,
  circumstancesSchema,
  policeSchema,
  alcoholSchema,
  drugsSchema,
  physicalHealthSchema,
  mentalHealthSchema,
  callbackSchema,
  checkAnswersSchema,
} from '../schemas/submissionSchemas'

export default function routes(): Router {
  const router = Router({ mergeParams: true })
  const get = (routePath: string | string[], handler: RequestHandler) => router.get(routePath, asyncMiddleware(handler))

  get('/', renderIndex)
  get('/verify', renderVerify)
  router.post('/verify', validateFormData(personalDetailsSchema), handleVerify)

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
  router.post('/questions/police-contact', validateFormData(policeSchema), (req, res) => {
    res.redirect('/submission/questions/alcohol')
  })

  get('/questions/alcohol', renderQuestionsAlcohol)
  router.post('/questions/alcohol', validateFormData(alcoholSchema), (req, res) => {
    res.redirect('/submission/questions/drugs')
  })

  get('/questions/drugs', renderQuestionsDrugs)
  router.post('/questions/drugs', validateFormData(drugsSchema), (req, res) => {
    res.redirect('/submission/questions/physical-health')
  })

  get('/questions/physical-health', renderQuestionsPhysicalHealth)
  router.post('/questions/physical-health', validateFormData(physicalHealthSchema), (req, res) => {
    res.redirect('/submission/questions/mental-health')
  })
  get('/questions/mental-health', renderQuestionsMentalHealth)
  router.post('/questions/mental-health', validateFormData(mentalHealthSchema), (req, res) => {
    res.redirect('/submission/questions/callback')
  })

  get('/questions/callback', renderQuestionsCallback)
  router.post('/questions/callback', validateFormData(callbackSchema), (req, res) => {
    res.redirect('/submission/check-your-answers')
  })

  get('/check-your-answers', renderCheckAnswers)
  router.post('/check-your-answers', validateFormData(checkAnswersSchema), (req, res) => {
    // API call to save submission data would go here
    // For now, we just redirect to confirmation
    res.redirect('/submission/confirmation')
  })

  get('/confirmation', renderConfirmation)

  return router
}
