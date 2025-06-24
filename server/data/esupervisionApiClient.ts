import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import Page from './models/page'
import Checkin from './models/checkin'
import CreateCheckinRequest from './models/createCheckinRequest'
import UploadLocationResponse from './models/uploadLocationResponse'
import LocationInfo from './models/locationInfo'
import CheckinSubmission from './models/checkinSubmission'

export default class EsupervisionApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('eSupervision API', config.apis.esupervisionApi, logger, authenticationClient)
  }

  getCheckins(practitionerId: string): Promise<Page<Checkin>> {
    return this.get<Page<Checkin>>(
      {
        path: '/offender_checkins',
        query: `practitionerId=${practitionerId}`,
      },
      asSystem(),
    )
  }

  getCheckin(checkinId: string): Promise<Checkin> {
    return this.get<Checkin>(
      {
        path: `/offender_checkins/${checkinId}`,
      },
      asSystem(),
    )
  }

  createCheckin(checkin: CreateCheckinRequest): Promise<Checkin> {
    return this.post<Checkin>({
      path: '/offender_checkins',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(checkin),
    })
  }

  async getCheckinVideoUploadLocation(checkinId: string, videoContentType: string): Promise<LocationInfo> {
    const location = await this.post<UploadLocationResponse>({
      path: `/offender_checkins/${checkinId}`,
      query: { 'content-type': videoContentType },
    })

    if (location.errorMessage) {
      // TODO: throw a better exception type?
      throw new Error(location.errorMessage)
    } else {
      return location.locationInfo
    }
  }

  submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.post<Checkin>({
      path: `/offender_checkins/${checkinId}/submit`,
      data: JSON.stringify(submission),
    })
  }
}
