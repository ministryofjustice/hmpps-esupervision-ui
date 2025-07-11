import { RequestHandler, Request } from 'express'
import { isEqual } from 'date-fns'
import logger from '../../logger'
import { services } from '../services'
import LocationInfo from '../data/models/locationInfo'
import MentalHealth from '../data/models/survey/mentalHealth'
import SupportAspect from '../data/models/survey/supportAspect'
import CallbackRequested from '../data/models/survey/callbackRequested'

const { esupervisionService, faceCompareService } = services()

const getSubmissionId = (req: Request): string => req.params.submissionId
const pageParams = (req: Request): Record<string, string> => {
  return {
    submissionId: getSubmissionId(req),
  }
}

export const handleStart: RequestHandler = async (req, res, next) => {
  req.session.formData = {}
  const { submissionId } = req.params
  res.redirect(`/submission/${submissionId}/verify`)
}

export const handleRedirect = (submissionPath: string): RequestHandler => {
  return (req, res) => {
    const { submissionId } = req.params
    const basePath = `/submission/${submissionId}`
    let redirectUrl = `${basePath}${submissionPath}`

    if (req.query.checkAnswers === 'true') {
      redirectUrl = `${basePath}/check-your-answers`
    }

    res.redirect(redirectUrl)
  }
}

export const renderIndex: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/index', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderVerify: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/verify', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const handleVerify: RequestHandler = async (req, res, next) => {
  const { submissionId } = req.params
  const { firstName, lastName, day, month, year } = req.body
  const dateOfBirth = new Date(`${year}-${month}-${day} 00:00 UTC`)

  const checkIn = res.locals.submission

  const { offender } = checkIn
  const offDob = new Date(`${offender.dateOfBirth} 00:00 UTC`)
  const isMatch =
    offender.firstName.toLocaleLowerCase().trim() === firstName.toLocaleLowerCase().trim() &&
    offender.lastName.toLocaleLowerCase().trim() === lastName.toLocaleLowerCase().trim() &&
    isEqual(offDob, dateOfBirth)

  if (!isMatch) {
    return res.render('pages/submission/no-match-found', { firstName, lastName, dateOfBirth, submissionId })
  }
  return res.redirect(`/submission/${submissionId}/questions/mental-health`)
}

export const renderVideoInform: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/video/inform', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderVideoRecord: RequestHandler = async (req, res, next) => {
  try {
    const { submissionId } = req.params
    const videoContentType = 'video/mp4'
    const frameContentType = 'image/jpeg'
    const promises = [
      esupervisionService.getCheckinVideoUploadLocation(submissionId, videoContentType),
      esupervisionService.getCheckinFrameUploadLocation(submissionId, frameContentType),
    ]
    const [videoResult, framesResult] = await Promise.all(promises)
    const videoUploadLocation = videoResult as LocationInfo
    const frameUploadLocations = framesResult as LocationInfo[]

    const checkIn = res.locals.submission
    const offenderPhoto = checkIn.offender.photoUrl
    // fetch the offender photo and create a blob
    const offenderReferencePhoto = await fetch(offenderPhoto).then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch offender photo: ${response.statusText}`)
      }
      return response.blob()
    })

    const [referencePhotoUploadUrl, ...snapshotPhotoUploadUrls] = frameUploadLocations.map(location => location.url)
    const referencePhotoUploadResult = await fetch(referencePhotoUploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': offenderReferencePhoto.type,
      },
      body: offenderReferencePhoto,
    })

    if (!referencePhotoUploadResult.ok) {
      throw new Error(`Failed to upload reference photo: ${referencePhotoUploadResult.statusText}`)
    } else {
      logger.debug('Reference photo uploaded successfully', referencePhotoUploadUrl)
    }

    res.render('pages/submission/video/record', {
      ...pageParams(req),
      videoUploadUrl: videoUploadLocation.url,
      frameUploadUrl: snapshotPhotoUploadUrls,
    })
  } catch (error) {
    next(error)
  }
}

export const handleVideoVerify: RequestHandler = async (req, res, next) => {
  try {
    const submissionId = getSubmissionId(req)
    logger.info('handleVideoVerify', submissionId)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const result = await faceCompareService.processSubmission(submissionId)
    await esupervisionService.updateAutomatedIdCheckStatus(submissionId, result)

    res.json({ status: 'SUCCESS', result })
  } catch (error) {
    res.json({ status: 'ERROR', message: error.message })
  }
}

export const renderViewVideo: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/video/view', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderQuestionsMentalHealth: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/mental-health', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderAssistance: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/assistance', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const handleAssistance: RequestHandler = async (req, res, next) => {
  const { assistance } = req.body
  const { submissionId } = req.params

  const supportFieldsMap: Record<string, keyof typeof req.session.formData> = {
    MENTAL_HEALTH: 'mentalHealthSupport',
    ALCOHOL: 'alcoholSupport',
    DRUGS: 'drugsSupport',
    MONEY: 'moneySupport',
    HOUSING: 'housingSupport',
    SUPPORT_SYSTEM: 'supportSystemSupport',
    OTHER: 'otherSupport',
  }

  // If the parent checkbox is not selected, clear all support fields from the session
  for (const [key, field] of Object.entries(supportFieldsMap)) {
    if (!assistance.includes(key)) {
      req.session.formData[field] = ''
    }
  }

  const basePath = `/submission/${submissionId}`
  let redirectUrl = `${basePath}/questions/callback`

  if (req.query.checkAnswers === 'true') {
    redirectUrl = `${basePath}/check-your-answers`
  }

  res.redirect(redirectUrl)
}

export const renderQuestionsCallback: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/callback', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/check-answers', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const handleSubmission: RequestHandler = async (req, res, next) => {
  const {
    mentalHealth,
    assistance,
    mentalHealthSupport,
    alcoholSupport,
    drugsSupport,
    moneySupport,
    housingSupport,
    supportSystemSupport,
    otherSupport,
    callback,
    callbackDetails,
  } = res.locals.formData

  const submissionId = getSubmissionId(req)
  const submission = {
    offender: res.locals.submission.offender.uuid,
    survey: {
      mentalHealth: mentalHealth as MentalHealth,
      assistance: assistance as SupportAspect[],
      mentalHealthSupport: mentalHealthSupport as string,
      alcoholSupport: alcoholSupport as string,
      drugsSupport: drugsSupport as string,
      moneySupport: moneySupport as string,
      housingSupport: housingSupport as string,
      supportSystemSupport: supportSystemSupport as string,
      otherSupport: otherSupport as string,
      callback: callback as CallbackRequested,
      callbackDetails: callbackDetails as string,
    },
  }
  try {
    await esupervisionService.submitCheckin(submissionId, submission)
  } catch (error) {
    next(error)
  }

  res.redirect(`/submission/${submissionId}/confirmation`)
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/confirmation', pageParams(req))
  } catch (error) {
    next(error)
  }
}
