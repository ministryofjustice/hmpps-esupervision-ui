import CheckinStatus from './checkinStatus'
import AutomatedIdVerificationResult from './automatedIdVerificationResult'
import ManualIdVerificationResult from './manualIdVerificationResult'
import SurveyResponse from './survey/surveyResponse'
import Offender from './offender'

export default class Checkin {
  uuid: string

  status: CheckinStatus

  dueDate: string // TODO: parse datetime

  offender: Offender

  submittedAt?: string // TODO: parse datetime

  questions: string // TODO: find out structure

  surveyResponse?: SurveyResponse

  createdBy: string // TODO: parse uuid

  createdAt: string // TODO: parse datetime

  reviewedBy?: string // TODO: parse uuid

  reviewedAt?: string

  videoUrl: string // TODO: parse url?

  autoIdCheck?: AutomatedIdVerificationResult

  manualIdCheck?: ManualIdVerificationResult

  flaggedResponses: string[]

  reviewDueDate?: string // TODO: parse datetime
}
