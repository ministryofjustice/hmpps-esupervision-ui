import PersonOnProbationInviteStatus from './personOnProbationInviteStatus'

export default class PersonOnProbation {
  uuid: string

  firstName: string

  lastName: string

  dateOfBirth: string // TODO: parse date? optional?

  status: PersonOnProbationInviteStatus // TODO: should be removed

  createdAt: string // TODO: parse datetime?

  email: string

  phoneNumber: string

  photoUrl: string // TODO: parse url?
}
