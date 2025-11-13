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
import Offender from './models/offender'
import OffenderUpdate from './models/offenderUpdate'
import OffenderCheckinResponse from './models/offenderCheckinResponse'
import AutomaticCheckinVerificationResult from './models/automaticCheckinVerificationResult'
import OffenderUpdateError from './offenderUpdateError'
import { ExternalUserId } from './models/loggedInUser'
import PractitionerInfo from './models/practitioner'
import PractitionerStats from './models/practitionerStats'
import Stats from './models/stats'
import OffenderInfoByContact from './models/offenderInfoByContact'
import { CheckinEventType } from './models/checkinEvent'

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

  getCheckins(
    practitionerId: ExternalUserId,
    page: number,
    size: number,
    offenderId?: string,
    direction?: 'ASC' | 'DESC',
  ): Promise<Page<Checkin>> {
    const query: Record<string, string | number> = { practitioner: practitionerId, page, size }
    if (offenderId) {
      query.offenderId = offenderId
    }
    if (direction) {
      query.direction = direction
    }

    return this.get<Page<Checkin>>(
      {
        path: '/offender_checkins',
        query,
      },
      asSystem(),
    )
  }

  getCheckin(checkinId: string, includeUploads?: boolean): Promise<OffenderCheckinResponse> {
    return this.get<OffenderCheckinResponse>(
      {
        path: `/offender_checkins/${checkinId}`,
        query: { 'include-uploads': includeUploads },
      },
      asSystem(),
    )
  }

  getOffenders(practitionerId: ExternalUserId, page: number, size: number): Promise<Page<Offender>> {
    return this.get<Page<Offender>>(
      {
        path: '/offenders',
        query: { practitioner: practitionerId, page, size },
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

  async reviewCheckin(
    practitionerId: ExternalUserId,
    checkinId: string,
    match?: boolean,
    missedCheckinComment?: string,
  ): Promise<Checkin> {
    const requestBody = {
      practitioner: practitionerId,
      manualIdCheck: match ? 'MATCH' : 'NO_MATCH',
      missedCheckinComment,
    }

    return this.post<Checkin>(
      {
        path: `/offender_checkins/${checkinId}/review`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(requestBody),
      },
      asSystem(),
    )
  }

  /**
   * Allows to log events related to a checkin.
   */
  async logCheckinEvent(checkinId: string, eventType: CheckinEventType, comment?: string): Promise<{ event: string }> {
    return this.post<{ event: string }>(
      {
        path: `/offender_checkins/${checkinId}/event`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ eventType, comment }),
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

  async getOffenderByContactDetail(offenderInfo: OffenderInfoByContact): Promise<Page<Offender> | null> {
    return this.get<Page<Offender>>(
      {
        path: `/offenders`,
        query: offenderInfo,
      },
      asSystem(),
    ).catch((error): Promise<Page<Offender> | null> => {
      if (error?.responseStatus === 404) {
        return null
      }
      throw error
    })
  }

  async updateOffender(offenderId: string, offenderUpdate: OffenderUpdate): Promise<Offender> {
    return this.post<Offender>(
      {
        path: `/offenders/${offenderId}/details`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(offenderUpdate),
      },
      asSystem(),
    ).catch((error): Promise<Offender> => {
      if (error?.responseStatus === 404) {
        throw new OffenderUpdateError(`Offender with ID ${offenderId} not found so could not be updated`, 404)
      } else if (error?.responseStatus === 400 || error?.responseStatus === 422) {
        throw new OffenderUpdateError(`Offender with ID ${offenderId} could not be updated`, 400)
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

  async stopCheckins(practitionerId: ExternalUserId, offenderId: string, stopCheckinDetails: string): Promise<void> {
    return this.post<void>(
      {
        path: `/offenders/${offenderId}/deactivate`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ requestedBy: practitionerId, reason: stopCheckinDetails }),
      },
      asSystem(),
    )
  }

  resendCheckinInvite(checkinId: string, practitionerId: ExternalUserId): Promise<Checkin> {
    const requestBody = {
      practitioner: practitionerId,
    }

    return this.post<Checkin>(
      {
        path: `/offender_checkins/${checkinId}/invite`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(requestBody),
      },
      asSystem(),
    )
  }

  async autoVerifyCheckinIdentity(
    checkinId: string,
    numSnapshots: number,
  ): Promise<AutomaticCheckinVerificationResult> {
    return this.post<AutomaticCheckinVerificationResult>(
      {
        path: `/offender_checkins/${checkinId}/auto_id_verify`,
        headers: { 'Content-Type': 'application/json' },
        query: { numSnapshots },
      },
      asSystem(),
    )
  }

  async getPractitionerByUsername(username: string): Promise<PractitionerInfo | null> {
    return this.get<PractitionerInfo>(
      {
        path: `/practitioners/username/${username}`,
      },
      asSystem(),
    ).catch((error): Promise<PractitionerInfo | null> => {
      if (error?.responseStatus === 404) {
        return null
      }
      throw error
    })
  }

  async getOffenderCountByPractitioner(): Promise<PractitionerStats[]> {
    return this.get<PractitionerStats[]>(
      {
        path: '/stats/practitioner/registrations',
      },
      asSystem(),
    )
  }

  async getCheckinStats(): Promise<Stats> {
    return this.get<Stats>(
      {
        path: '/stats/checkins',
      },
      asSystem(),
    )
  }
}
