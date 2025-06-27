import OffenderStatus from './offenderStatus'

export default class Offender {
  uuid: string

  firstName: string

  lastName: string

  dateOfBirth: string // TODO: parse date

  status: OffenderStatus

  createdAt: string // TODO: parse datetime

  // val updatedAt: Instant,
  email: string

  phoneNumber: string

  // NOTE: not always present!
  photoUrl: string // TODO: parse URL
}
