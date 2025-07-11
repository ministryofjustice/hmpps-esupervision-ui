import EsupervisionApiClient from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'

import LocationInfo from '../data/models/locationInfo'

import OffenderInfo from '../data/models/offenderInfo'
import OffenderSetup from '../data/models/offenderSetup'
import CheckinSubmission from '../data/models/checkinSubmission'
import CreateCheckinRequest from '../data/models/createCheckinRequest'
import AutomatedIdVerificationResult from '../data/models/automatedIdVerificationResult'
import Practitioner from '../data/models/pracitioner'
import PractitionerSetup from '../data/models/pracitionerSetup'
import Offender from '../data/models/offender'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCheckins(practitionerUuid: string): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins(practitionerUuid)
  }

  getCheckin(submissionId: string): Promise<Checkin> {
    return this.esupervisionApiClient.getCheckin(submissionId)
  }

  getCheckinVideoUploadLocation(submissionId: string, videoContentType: string): Promise<LocationInfo> {
    return this.esupervisionApiClient.getCheckinVideoUploadLocation(submissionId, videoContentType)
  }

  getCheckinFrameUploadLocation(submissionId: string, contentType: string): Promise<LocationInfo[]> {
    return this.esupervisionApiClient.getCheckinFrameUploadLocation(submissionId, contentType)
  }

  getOffenders(page: number, size: number): Promise<Page<OffenderInfo>> {
    return this.esupervisionApiClient.getOffenders(page, size)
  }

  submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.esupervisionApiClient.submitCheckin(checkinId, submission)
  }

  createOffender(offenderInfo: OffenderInfo): Promise<OffenderSetup> {
    return this.esupervisionApiClient.createOffender(offenderInfo)
  }

  getProfilePhotoUploadLocation(offenderSetup: OffenderSetup, photoContentType: string): Promise<LocationInfo> {
    return this.esupervisionApiClient.getProfilePhotoUploadLocation(offenderSetup, photoContentType)
  }

  completeOffenderSetup(offenderSetup: OffenderSetup): Promise<Offender> {
    return this.esupervisionApiClient.completeOffenderSetup(offenderSetup)
  }

  createCheckin(checkin: CreateCheckinRequest): Promise<Checkin> {
    return this.esupervisionApiClient.createCheckin(checkin)
  }

  createPractitioner(practitioner: Practitioner): Promise<PractitionerSetup> {
    return this.esupervisionApiClient.createPractitioner(practitioner)
  }

  updateAutomatedIdCheckStatus(checkinId: string, result: AutomatedIdVerificationResult): Promise<Checkin> {
    return this.esupervisionApiClient.updateAutomatedIdCheckStatus(checkinId, result)
  }
}
