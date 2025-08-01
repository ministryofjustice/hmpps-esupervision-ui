import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import Page from './models/page'
import Checkin from './models/checkin'
import CreateCheckinRequest from './models/createCheckinRequest'
import UploadLocationResponse from './models/uploadLocationResponse'
import CheckinUploadLocationResponse from './models/checkinUploadLocationResponse'
import LocationInfo from './models/locationInfo'
import CheckinSubmission from './models/checkinSubmission'
import OffenderInfo from './models/offenderInfo'
import OffenderSetup from './models/offenderSetup'
import AutomatedIdVerificationResult from './models/automatedIdVerificationResult'
import Practitioner from './models/pracitioner'
import PractitionerSetup from './models/pracitionerSetup'
import Offender from './models/offender'

/**
 * Specifies content types for possible upload locations for a checkin.
 */
export type CheckinUploadContentTypes = {
  video: string
  reference: string
  snapshots: string[]
}

export default class EsupervisionApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('eSupervision API', config.apis.esupervisionApi, logger, authenticationClient)
  }

  getCheckins(practitionerUuid: string, page: number, size: number): Promise<Page<Checkin>> {
    return this.get<Page<Checkin>>(
      {
        path: '/offender_checkins',
        query: { practitionerUuid, page, size },
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

  getOffenders(practitionerUuid: string, page: number, size: number): Promise<Page<OffenderInfo>> {
    return this.get<Page<OffenderInfo>>(
      {
        path: '/offenders',
        query: { practitionerUuid, page, size },
      },
      asSystem(),
    )
  }

  async getCheckinUploadLocation(
    checkinId: string,
    contentTypes: CheckinUploadContentTypes,
  ): Promise<CheckinUploadLocationResponse> {
    const { video, reference, snapshots } = contentTypes
    const locations = await this.post<CheckinUploadLocationResponse>(
      {
        path: `/offender_checkins/${checkinId}/upload_location`,
        query: { video, reference, snapshots: snapshots.join(',') },
        headers: { 'Content-Type': 'application/json' },
      },
      asSystem(),
    )

    return locations
  }

  async getProfilePhotoUploadLocation(offenderSetup: OffenderSetup, photoContentType: string): Promise<LocationInfo> {
    const location = await this.post<UploadLocationResponse>(
      {
        path: `/offender_setup/${offenderSetup.uuid}/upload_location`,
        query: { 'content-type': photoContentType },
        headers: { 'Content-Type': 'application/json' },
      },
      asSystem(),
    )

    if (location.errorMessage) {
      throw new Error(`Failed to get profile photo upload location: ${location.errorMessage}`)
    } else {
      return location.locationInfo
    }
  }

  completeOffenderSetup(setupId: string): Promise<Offender> {
    return this.post<Offender>(
      {
        path: `/offender_setup/${setupId}/complete`,
      },
      asSystem(),
    )
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

  async reviewCheckin(practitionerUuid: string, checkinId: string, match: boolean): Promise<Checkin> {
    return this.post<Checkin>(
      {
        path: `/offender_checkins/${checkinId}/review`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ practitioner: practitionerUuid, manualIdCheck: match ? 'MATCH' : 'NO_MATCH' }),
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

  async getOffender(offenderId: string): Promise<Offender | null> {
    return this.get<Offender>(
      {
        path: `/offenders/${offenderId}`,
      },
      asSystem(),
    ).catch((error): Promise<Offender | null> => {
      if (error?.responseStatus === 404) {
        return null
      }
      throw error
    })
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
