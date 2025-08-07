import CheckinInterval from './checkinInterval'

export default class OffenderUpdate {
  requestedBy: string

  firstName?: string

  lastName?: string

  dateOfBirth?: string

  email?: string

  phoneNumber?: string

  firstCheckin?: string

  checkinInterval?: CheckinInterval
}
