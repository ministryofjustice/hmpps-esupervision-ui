import CheckinStatus from './checkinStatus'
import AutomatedIdVerificationResult from './automatedIdVerificationResult'
import ManualIdVerificationResult from './manualIdVerificationResult'
import SurveyResponse from './survey/surveyResponse'
import Offender from './offender'
import { ExternalUserId } from './loggedInUser'

export default class Checkin {
  uuid: string

  status: CheckinStatus

  dueDate: string // TODO: parse datetime

  offender: Offender

  submittedAt?: string // TODO: parse datetime

  questions: string // TODO: find out structure

  surveyResponse?: SurveyResponse

  createdBy: ExternalUserId

  createdAt: string // TODO: parse datetime

  reviewedBy?: ExternalUserId

  reviewedAt?: string

  videoUrl: string // TODO: parse url?

  autoIdCheck?: AutomatedIdVerificationResult

  manualIdCheck?: ManualIdVerificationResult

  flaggedResponses: string[]

  reviewDueDate?: string // TODO: parse datetime

  checkinStartedAt?: string // TODO: parse datetime
}
