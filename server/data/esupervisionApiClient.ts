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

  getCheckins(): Promise<Page<Checkin>> {
    return this.get<Page<Checkin>>(
      {
        path: '/offender_checkins',
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
    const location = await this.post<UploadLocationResponse>(
      {
        path: `/offender_checkins/${checkinId}/upload_location`,
        query: { 'content-type': videoContentType },
        headers: { 'Content-Type': 'application/json' },
      },
      asSystem(),
    )

    if (location.errorMessage && location.locationInfo) {
      throw new Error(`Failed to get video upload location: ${location.errorMessage}`)
    } else {
      return location.locationInfo
    }
  }

  async getCheckinFrameUploadLocation(checkinId: string, frameContentType: string): Promise<LocationInfo[]> {
    const location = await this.post<UploadLocationResponse>(
      {
        path: `/offender_checkins/${checkinId}/upload_location`,
        query: { 'content-type': frameContentType, 'num-snapshots': 2 },
        headers: { 'Content-Type': 'application/json' },
      },
      asSystem(),
    )

    if (location.errorMessage && location.locations) {
      throw new Error(`Failed to get snapshot upload location: ${location.errorMessage}`)
    } else {
      return location.locations
    }
  }

  submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.post<Checkin>({
      path: `/offender_checkins/${checkinId}/submit`,
      data: JSON.stringify(submission),
    })
  }
}
