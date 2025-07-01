import { RequestHandler, Request } from 'express'
import { isEqual } from 'date-fns'
import userFriendlyStrings from '../utils/userFriendlyStrings'
import logger from '../../logger'
import { services } from '../services'
import LocationInfo from '../data/models/locationInfo'

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
    offender.firstName.toLocaleLowerCase() === firstName.toLocaleLowerCase() &&
    offender.lastName.toLocaleLowerCase() === lastName.toLocaleLowerCase() &&
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
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    res.on('error', error => {
      logger.error('Error writing to stream', error)
    })
    req.on('close', () => {
      logger.info('Client disconnected', submissionId)
    })

    res.write(`data: ${JSON.stringify({ type: 'message', message: 'starting id verification' })}\n\n`)

    const result = await faceCompareService.processSubmission(submissionId)

    res.write(`data: ${JSON.stringify({ type: 'result', message: 'id verification complete', result })}\n\n`)
    await esupervisionService.updateAutomatedIdCheckStatus(submissionId, result)

    res.end()
  } catch (error) {
    next(error)
  }
}

export const handleVideoPost: RequestHandler = async (req, res, next) => {
  const { submissionId } = req.params
  res.redirect(`/submission/${submissionId}/video/review`)
}

export const renderVideoReview: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/video/review', pageParams(req))
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

export const renderQuestionsCallback: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/questions/callback', pageParams(req))
  } catch (error) {
    next(error)
  }
}

export const renderCheckAnswers: RequestHandler = async (req, res, next) => {
  const { circumstances, policeContact, alcoholUse, alcoholUnits, drugsUse, physicalHealth, mentalHealth, callback } =
    res.locals.formData

  res.locals.circumstancesList = extractListItems(circumstances)
  res.locals.policeContact = userFriendlyStrings(policeContact)
  res.locals.alcoholUse = userFriendlyStrings(alcoholUse)
  res.locals.alcoholUnits = extractListItems(alcoholUnits)
  res.locals.drugsUse = userFriendlyStrings(drugsUse)
  res.locals.physicalHealth = userFriendlyStrings(physicalHealth)
  res.locals.mentalHealth = userFriendlyStrings(mentalHealth)
  res.locals.callback = userFriendlyStrings(callback)

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
  const data = {
    offender: res.locals.submission.offender.uuid,
    answers: JSON.stringify({
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
    }),
  }
  try {
    await esupervisionService.submitCheckin(submissionId, data)
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

function extractListItems(formItem: string | string[]): string {
  if (typeof formItem === 'string') {
    return userFriendlyStrings(formItem)
  }

  if (Array.isArray(formItem)) {
    formItem.map(item => userFriendlyStrings(item))
    return formItem.join(',<br />')
  }

  return ''
}
