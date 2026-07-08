import PopApiClient from '../data/popApiClient'

export type InvitePopInput = {
  crn: string
  email?: string
  mobile?: string
  createdByUsername: string
}

export default class PopService {
  constructor(private readonly popApiClient: PopApiClient) {}

  invitePop({ crn, email, mobile, createdByUsername }: InvitePopInput): Promise<void> {
    return this.popApiClient.createRegistrationInvite({
      personReference: crn,
      email,
      mobileNumber: mobile,
      createdByUsername,
    })
  }
}
