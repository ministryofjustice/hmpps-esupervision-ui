import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'

export type RegistrationInviteRequest = {
  personReference: string
  email?: string
  mobileNumber?: string
}

export default class PopApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('PoP API', config.apis.popApi, logger, authenticationClient)
  }

  async createRegistrationInvite(invite: RegistrationInviteRequest): Promise<void> {
    return this.post<void>(
      {
        path: '/v1/registration-invites',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(invite),
      },
      asSystem(),
    )
  }
}
