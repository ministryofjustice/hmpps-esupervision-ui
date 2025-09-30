import OffenderStatus from './offenderStatus'
import CheckinInterval from './checkinInterval'

export default class Offender {
  uuid: string

  firstName: string

  lastName: string

  crn: string

  dateOfBirth: string // TODO: parse date

  status: OffenderStatus

  createdAt: string // TODO: parse datetime

  // val updatedAt: Instant,
  email: string

  phoneNumber: string

  // NOTE: not always present!
  photoUrl: string // TODO: parse URL

  firstCheckin: string

  checkinInterval: CheckinInterval

  deactivationEntry?: { createdAt: string; comment: string; uuid: string }
}
