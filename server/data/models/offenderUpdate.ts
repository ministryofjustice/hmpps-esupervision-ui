import CheckinInterval from './checkinInterval'
import { ExternalUserId } from './loggedInUser'

export default class OffenderUpdate {
  requestedBy: ExternalUserId

  firstName?: string

  lastName?: string

  crn?: string

  dateOfBirth?: string

  email?: string

  phoneNumber?: string

  firstCheckin?: string

  checkinInterval?: CheckinInterval
}
