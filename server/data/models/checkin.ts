import CheckinStatus from './checkinStatus'
import PersonOnProbation from './personOnProbation'
import AutomatedIdVerificationResult from './automatedIdVerificationResult'
import ManualIdVerificationResult from './manualIdVerificationResult'

export default class Checkin {
  uuid: string

  status: CheckinStatus

  dueDate: string // TODO: parse datetime

  offender: PersonOnProbation

  submittedOn: string // TODO: parse datetime

  questions: string // TODO: find out structure

  answers: string // TODO: find out structure

  createdBy: string // TODO: parse uuid

  createdAt: string // TODO: parse datetime

  reviewedBy: string // TODO: parse uuid

  videoUrl: string // TODO: parse url?

  autoIdCheck: AutomatedIdVerificationResult

  manualIdCheck: ManualIdVerificationResult
}
