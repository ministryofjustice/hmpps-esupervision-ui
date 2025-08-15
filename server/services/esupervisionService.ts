import EsupervisionApiClient, { CheckinUploadContentTypes } from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'

import LocationInfo from '../data/models/locationInfo'

import OffenderInfo from '../data/models/offenderInfo'
import OffenderSetup from '../data/models/offenderSetup'
import CheckinSubmission from '../data/models/checkinSubmission'
import CreateCheckinRequest from '../data/models/createCheckinRequest'
import Practitioner from '../data/models/pracitioner'
import PractitionerSetup from '../data/models/pracitionerSetup'
import Offender from '../data/models/offender'
import CheckinUploadLocationResponse from '../data/models/checkinUploadLocationResponse'
import OffenderUpdate from '../data/models/offenderUpdate'
import OffenderCheckinResponse from '../data/models/offenderCheckinResponse'
import AutomaticCheckinVerificationResult from '../data/models/automaticCheckinVerificationResult'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCheckins(practitionerUuid: string, page: number, size: number): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins(practitionerUuid, page, size)
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

  getOffenders(practitionerUuid: string, page: number, size: number): Promise<Page<OffenderInfo>> {
    return this.esupervisionApiClient.getOffenders(practitionerUuid, page, size)
  }

  submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.esupervisionApiClient.submitCheckin(checkinId, submission)
  }

  reviewCheckin(practitionerUuid: string, checkinId: string, match: boolean): Promise<Checkin> {
    return this.esupervisionApiClient.reviewCheckin(practitionerUuid, checkinId, match)
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

  updateOffender(offenderId: string, offenderUpdate: OffenderUpdate): Promise<Offender> {
    return this.esupervisionApiClient.updateOffender(offenderId, offenderUpdate)
  }

  completeOffenderSetup(setupId: string): Promise<Offender> {
    return this.esupervisionApiClient.completeOffenderSetup(setupId)
  }

  createCheckin(checkin: CreateCheckinRequest): Promise<Checkin> {
    return this.esupervisionApiClient.createCheckin(checkin)
  }

  stopCheckins(practitionerUuid: string, offenderId: string, stopCheckinDetails: string): Promise<void> {
    return this.esupervisionApiClient.stopCheckins(practitionerUuid, offenderId, stopCheckinDetails)
  }

  createPractitioner(practitioner: Practitioner): Promise<PractitionerSetup> {
    return this.esupervisionApiClient.createPractitioner(practitioner)
  }

  autoVerifyCheckinIdentity(checkinId: string, numSnapshots: number): Promise<AutomaticCheckinVerificationResult> {
    return this.esupervisionApiClient.autoVerifyCheckinIdentity(checkinId, numSnapshots)
  }
}
