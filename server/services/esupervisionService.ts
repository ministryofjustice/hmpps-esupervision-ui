import EsupervisionApiClient, { CheckinUploadContentTypes } from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'
import LocationInfo from '../data/models/locationInfo'
import OffenderInfo from '../data/models/offenderInfo'
import OffenderSetup from '../data/models/offenderSetup'
import CheckinSubmission from '../data/models/checkinSubmission'
import CreateCheckinRequest from '../data/models/createCheckinRequest'
import Offender from '../data/models/offender'
import CheckinUploadLocationResponse from '../data/models/checkinUploadLocationResponse'
import OffenderUpdate from '../data/models/offenderUpdate'
import OffenderCheckinResponse from '../data/models/offenderCheckinResponse'
import AutomaticCheckinVerificationResult from '../data/models/automaticCheckinVerificationResult'
import { ExternalUser } from '../data/models/loggedInUser'
import PractitionerInfo from '../data/models/practitioner'
import PractitionerStats from '../data/models/practitionerStats'
import Stats from '../data/models/stats'
import OffenderInfoByContact from '../data/models/offenderInfoByContact'
import { CheckinEventType } from '../data/models/checkinEvent'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCheckins(
    practitioner: ExternalUser,
    page: number,
    size: number,
    offenderId?: string,
    direction?: 'ASC' | 'DESC',
  ): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins(practitioner.externalId(), page, size, offenderId, direction)
  }

  getCheckin(submissionId: string, includeUploads?: boolean): Promise<OffenderCheckinResponse> {
    return this.esupervisionApiClient.getCheckin(submissionId, includeUploads)
  }

  getCheckinUploadLocation(
    submissionId: string,
    contentTypes: CheckinUploadContentTypes,
  ): Promise<CheckinUploadLocationResponse> {
    return this.esupervisionApiClient.getCheckinUploadLocation(submissionId, contentTypes)
  }

  getOffenders(practitioner: ExternalUser, page: number, size: number): Promise<Page<Offender>> {
    return this.esupervisionApiClient.getOffenders(practitioner.externalId(), page, size)
  }

  submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.esupervisionApiClient.submitCheckin(checkinId, submission)
  }

  reviewCheckin(
    practitioner: ExternalUser,
    checkinId: string,
    match?: boolean,
    missedCheckinComment?: string,
  ): Promise<Checkin> {
    return this.esupervisionApiClient.reviewCheckin(practitioner.externalId(), checkinId, match, missedCheckinComment)
  }

  logCheckinEvent(checkinId: string, eventType: CheckinEventType, comment?: string): Promise<{ event: string }> {
    return this.esupervisionApiClient.logCheckinEvent(checkinId, eventType, comment)
  }

  createOffender(offenderInfo: OffenderInfo): Promise<OffenderSetup> {
    return this.esupervisionApiClient.createOffender(offenderInfo)
  }

  getProfilePhotoUploadLocation(offenderSetup: OffenderSetup, photoContentType: string): Promise<LocationInfo> {
    return this.esupervisionApiClient.getProfilePhotoUploadLocation(offenderSetup, photoContentType)
  }

  getOffender(offenderId: string): Promise<Offender | null> {
    return this.esupervisionApiClient.getOffender(offenderId)
  }

  getOffenderByContactDetail(offenderInfo: OffenderInfoByContact): Promise<Page<Offender> | null> {
    return this.esupervisionApiClient.getOffenderByContactDetail(offenderInfo)
  }

  updateOffender(offenderId: string, offenderUpdate: OffenderUpdate): Promise<Offender> {
    return this.esupervisionApiClient.updateOffender(offenderId, offenderUpdate)
  }

  completeOffenderSetup(setupId: string): Promise<Offender> {
    return this.esupervisionApiClient.completeOffenderSetup(setupId)
  }

  createCheckin(checkin: CreateCheckinRequest): Promise<Checkin> {
    return this.esupervisionApiClient.createCheckin(checkin)
  }

  stopCheckins(practitioner: ExternalUser, offenderId: string, stopCheckinDetails: string): Promise<void> {
    return this.esupervisionApiClient.stopCheckins(practitioner.externalId(), offenderId, stopCheckinDetails)
  }

  resendCheckinInvite(checkinId: string, practitioner: ExternalUser): Promise<Checkin> {
    return this.esupervisionApiClient.resendCheckinInvite(checkinId, practitioner.externalId())
  }

  autoVerifyCheckinIdentity(checkinId: string, numSnapshots: number): Promise<AutomaticCheckinVerificationResult> {
    return this.esupervisionApiClient.autoVerifyCheckinIdentity(checkinId, numSnapshots)
  }

  getPractitionerByUsername(username: string): Promise<PractitionerInfo | null> {
    return this.esupervisionApiClient.getPractitionerByUsername(username)
  }

  getOffenderCountByPractitioner(): Promise<PractitionerStats[]> {
    return this.esupervisionApiClient.getOffenderCountByPractitioner()
  }

  getCheckinStats(): Promise<Stats> {
    return this.esupervisionApiClient.getCheckinStats()
  }
}
