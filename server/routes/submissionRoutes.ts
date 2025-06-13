import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import validateFormData from '../middleware/validateFormData'
import {
  handleRedirect,
  handleAlcohol,
  handleVerify,
  renderCheckAnswers,
  renderConfirmation,
  renderIndex,
  renderQuestionsAlcohol,
  renderQuestionsAlcoholUnits,
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
  circumstancesSchema,
  policeSchema,
  alcoholSchema,
  alcoholUnitsSchema,
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

  get('/questions/circumstances', renderQuestionsCircumstances)
  router.post(
    '/questions/circumstances',
    validateFormData(circumstancesSchema),
    handleRedirect('/submission/questions/police-contact'),
  )

  get('/questions/police-contact', renderQuestionsPoliceContact)
  router.post(
    '/questions/police-contact',
    validateFormData(policeSchema),
    handleRedirect('/submission/questions/alcohol'),
  )

  get('/questions/alcohol', renderQuestionsAlcohol)
  router.post('/questions/alcohol', validateFormData(alcoholSchema), handleAlcohol)

  get('/questions/alcohol-units', renderQuestionsAlcoholUnits)
  router.post(
    '/questions/alcohol-units',
    validateFormData(alcoholUnitsSchema),
    handleRedirect('/submission/questions/drugs'),
  )

  get('/questions/drugs', renderQuestionsDrugs)
  router.post(
    '/questions/drugs',
    validateFormData(drugsSchema),
    handleRedirect('/submission/questions/physical-health'),
  )

  get('/questions/physical-health', renderQuestionsPhysicalHealth)
  router.post(
    '/questions/physical-health',
    validateFormData(physicalHealthSchema),
    handleRedirect('/submission/questions/mental-health'),
  )

  get('/questions/mental-health', renderQuestionsMentalHealth)
  router.post(
    '/questions/mental-health',
    validateFormData(mentalHealthSchema),
    handleRedirect('/submission/questions/callback'),
  )

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
