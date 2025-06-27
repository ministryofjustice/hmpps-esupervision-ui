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
import OffenderInfo from './models/offenderInfo'
import OffenderSetup from './models/offenderSetup'
import AutomatedIdVerificationResult from './models/automatedIdVerificationResult'
import Practitioner from './models/pracitioner'
import PractitionerSetup from './models/pracitionerSetup'

export default class EsupervisionApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('eSupervision API', config.apis.esupervisionApi, logger, authenticationClient)
  }

  getCheckins(practitionerUuid: string): Promise<Page<Checkin>> {
    return this.get<Page<Checkin>>(
      {
        path: '/offender_checkins',
        query: { practitionerUuid },
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

  getOffenders(): Promise<Page<OffenderInfo>> {
    return this.get<Page<OffenderInfo>>(
      {
        path: '/offenders',
      },
      asSystem(),
    )
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

  async submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.post<Checkin>(
      {
        path: `/offender_checkins/${checkinId}/submit`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(submission),
      },
      asSystem(),
    )
  }

  async createOffender(offenderInfo: OffenderInfo): Promise<OffenderSetup> {
    return this.post<OffenderSetup>(
      {
        path: '/offender_setup',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(offenderInfo),
      },
      asSystem(),
    )
  }

  async createCheckin(checkinInfo: CreateCheckinRequest): Promise<Checkin> {
    return this.post<Checkin>(
      {
        path: '/offender_checkins',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(checkinInfo),
      },
      asSystem(),
    )
  }

  async createPractitioner(practitioner: Practitioner): Promise<PractitionerSetup> {
    return this.post<PractitionerSetup>(
      {
        path: '/practitioners',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(practitioner),
      },
      asSystem(),
    )
  }

  async updateAutomatedIdCheckStatus(checkinId: string, result: AutomatedIdVerificationResult): Promise<Checkin> {
    return this.post<Checkin>(
      {
        path: `/offender_checkins/${checkinId}/auto_id_check`,
        headers: { 'Content-Type': 'application/json' },
        query: { result },
      },
      asSystem(),
    )
  }
}
