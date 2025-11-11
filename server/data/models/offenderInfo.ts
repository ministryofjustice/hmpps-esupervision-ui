import CheckinInterval from './checkinInterval'
import { ExternalUserId } from './loggedInUser'

export default class OffenderInfo {
  setupUuid: string

  practitionerId: ExternalUserId

  firstName: string

  lastName: string

  crn: string

  dateOfBirth: string

  email: string

  phoneNumber: string

  firstCheckinDate: string

  checkinInterval: CheckinInterval

  startedAt: string
}
