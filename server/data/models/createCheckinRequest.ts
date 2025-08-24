import { ExternalUserId } from './loggedInUser'

export default class CreateCheckinRequest {
  practitioner: ExternalUserId

  offender: string // TODO: require uuid?

  dueDate: string // TODO: require date?
}
