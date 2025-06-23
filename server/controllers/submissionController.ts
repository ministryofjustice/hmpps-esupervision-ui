import { RequestHandler, Request } from 'express'
import { format } from 'date-fns'
import userFriendlyStrings from '../utils/userFriendlyStrings'

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
  const { firstName, lastName, day, month, year } = req.body
  const dateOfBirth = `${day}/${month}/${year}`
  const { submissionId } = req.params

  // Check if details match
  if (firstName === 'John') {
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
    const now = new Date()
    const todayDay = format(now, 'EEEE')
    const todayDate = format(now, 'do MMMM yyyy')
    const submissionId = getSubmissionId(req)

    res.render('pages/submission/video/record', { todayDate, todayDay, submissionId })
  } catch (error) {
    next(error)
  }
}

export const renderVideoReview: RequestHandler = async (req, res, next) => {
  try {
    const now = new Date()
    const todayDay = format(now, 'EEEE')
    const todayDate = format(now, 'do MMMM yyyy')
    const submissionId = getSubmissionId(req)

    res.render('pages/submission/video/review', { todayDate, todayDay, submissionId })
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

export const handleSubmission: RequestHandler = (req, res) => {
  // API call to save submission data would go here
  // For now, we just redirect to confirmation
  const submissionId = getSubmissionId(req)
  res.redirect(`/submission/${submissionId}/confirmation`)
}

export const renderConfirmation: RequestHandler = async (req, res, next) => {
  try {
    res.render('pages/submission/confirmation')
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
