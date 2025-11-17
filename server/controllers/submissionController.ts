import { RequestHandler, Request, Response } from 'express'
import { isEqual } from 'date-fns'
import logger from '../../logger'
import { services } from '../services'
import MentalHealth from '../data/models/survey/mentalHealth'
import SupportAspect from '../data/models/survey/supportAspect'
import CallbackRequested from '../data/models/survey/callbackRequested'
import OffenderCheckinResponse from '../data/models/offenderCheckinResponse'
import { DeviceInfo } from '../data/models/survey/surveyResponse'

type SubmissionLocals = { submission: OffenderCheckinResponse }

const { esupervisionService } = services()

const getSubmissionId = (req: Request): string => req.params.submissionId
const pageParams = (req: Request): Record<string, string | boolean> => {
  const cya = req.query.checkAnswers === 'true'
  return {
    cya,
    autoVerifyResult: cya ? (req.session.formData.autoVerifyResult as string) : '',
    submissionId: getSubmissionId(req),
  }
}

export const handleStart: RequestHandler = async (req, res, next) => {
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
    req.session.formData = { checkinStartedAt: Date.now() }
    res.render('pages/submission/index', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderVerify: RequestHandler = async (req, res, next) => {
  try {
    const errors = req.flash('error')

    res.render('pages/submission/verify', { ...pageParams(req), errorMessage: errors[0] })
  } catch (error) {
    next(error)
  }
}

export const handleVerify: RequestHandler = async (req, res: Response<object, SubmissionLocals>, next) => {
  const { submissionId } = req.params
  const { firstName, lastName, day, month, year } = req.body
  const dateOfBirth = new Date(`${year}-${month}-${day} 00:00 UTC`)

  const checkIn = res.locals.submission.checkin

  const { offender } = checkIn
  const offDob = new Date(`${offender.dateOfBirth} 00:00 UTC`)
  const isMatch =
    offender.firstName.toLocaleLowerCase().trim() === firstName.toLocaleLowerCase().trim() &&
    offender.lastName.toLocaleLowerCase().trim() === lastName.toLocaleLowerCase().trim() &&
    isEqual(offDob, dateOfBirth)

  if (!isMatch) {
    return res.render('pages/submission/no-match-found', { firstName, lastName, dateOfBirth, submissionId })
  }

  req.session.submissionAuthorized = submissionId
  logger.info(`User is verified and check in authorised for submissionId ${submissionId}`)
  return res.redirect(`/submission/${submissionId}/questions/mental-health`)
}

export const renderVideoInform: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/video/inform', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderVideoRecord: RequestHandler = async (req, res: Response<object, SubmissionLocals>, next) => {
  try {
    const { submissionId } = req.params
    const videoContentType = 'video/mp4'
    const frameContentType = 'image/jpeg'

    const checkIn = res.locals.submission.checkin
    const offenderPhoto = checkIn.offender.photoUrl
    // fetch the offender photo and create a blob
    const offenderReferencePhoto = await fetch(offenderPhoto).then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch offender photo: ${response.statusText}`)
      }
      return response.blob()
    })

    const uploadLocations = await esupervisionService.getCheckinUploadLocation(submissionId, {
      video: videoContentType,
      reference: offenderReferencePhoto.type,
      snapshots: [frameContentType, frameContentType],
    })

    if (
      uploadLocations.references.length === 0 ||
      uploadLocations.snapshots.length === 0 ||
      uploadLocations.video === undefined
    ) {
      throw new Error(`Failed to get upload locations: ${JSON.stringify(uploadLocations)}`)
    }

    const referencePhotoUploadResult = await fetch(uploadLocations.references[0].url, {
      method: 'PUT',
      headers: {
        'Content-Type': uploadLocations.references[0].contentType,
      },
      body: offenderReferencePhoto,
    })

    if (!referencePhotoUploadResult.ok) {
      throw new Error(`Failed to upload reference photo: ${referencePhotoUploadResult.statusText}`)
    } else {
      logger.debug('Reference photo uploaded successfully', uploadLocations.references[0].url)
    }

    res.render('pages/submission/video/record', {
      ...pageParams(req),
      videoUploadUrl: uploadLocations.video.url,
      frameUploadUrl: uploadLocations.snapshots.map(snapshot => snapshot.url),
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

    const result = await esupervisionService.autoVerifyCheckinIdentity(submissionId, 1)
    req.session.formData.autoVerifyResult = result.result

    res.json({ status: 'SUCCESS', result: result.result })
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

export const handleSubmission: RequestHandler = async (req, res: Response<object, SubmissionLocals>, next) => {
  const {
    mentalHealth,
    mentalHealthSupport,
    alcoholSupport,
    drugsSupport,
    moneySupport,
    housingSupport,
    supportSystemSupport,
    otherSupport,
    callback,
    callbackDetails,
    checkinStartedAt,
  } = res.locals.formData

  let { assistance } = res.locals.formData

  // If user selects a single assistance option, convert it to an array
  if (typeof assistance === 'string') {
    assistance = [assistance]
  }

  const { deviceData } = res.locals.formData
  let device: DeviceInfo | null = null

  if (deviceData && typeof deviceData === 'string') {
    try {
      device = JSON.parse(deviceData) as DeviceInfo
    } catch (error) {
      next(error)
    }
  }

  const submissionId = getSubmissionId(req)
  const submission = {
    offender: res.locals.submission.checkin.offender.uuid,
    survey: {
      version: '2025-07-10@pilot',
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
      device,
      checkinStartedAt: checkinStartedAt as Date,
    },
  }

  try {
    await esupervisionService.submitCheckin(submissionId, submission)
    res.redirect(`/submission/${submissionId}/confirmation`)
  } catch (error) {
    next(error)
  }
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    req.session = null
    res.render('pages/submission/confirmation', pageParams(req))
  } catch (error) {
    next(error)
  }
}
