import CheckinInterval from './checkinInterval'

export default class OffenderInfo {
  setupUuid: string

  practitionerId: string

  firstName: string

  lastName: string

  dateOfBirth: string

  email: string

  phoneNumber: string

  nextCheckinDate: string

  checkinInterval: CheckinInterval
}
