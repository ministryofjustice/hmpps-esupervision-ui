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

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCheckins(practitioner: ExternalUser, page: number, size: number): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins(practitioner.externalId(), page, size)
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

  stopCheckins(practitioner: ExternalUser, offenderId: string, stopCheckinDetails: string): Promise<void> {
    return this.esupervisionApiClient.stopCheckins(practitioner.externalId(), offenderId, stopCheckinDetails)
  }

  autoVerifyCheckinIdentity(checkinId: string, numSnapshots: number): Promise<AutomaticCheckinVerificationResult> {
    return this.esupervisionApiClient.autoVerifyCheckinIdentity(checkinId, numSnapshots)
  }

  getPractitionerByUsername(username: string): Promise<PractitionerInfo | null> {
    return this.esupervisionApiClient.getPractitionerByUsername(username)
  }

  getOffenderCountByPractitioner(): PractitionerStats[] {
    return [
      { practitioner: 'Amelia Clarke', siteName: 'Watford', registrationCount: 5 },
      { practitioner: 'Oliver Patel', siteName: 'Watford', registrationCount: 3 },
      { practitioner: 'Hannah McBride', siteName: 'Watford', registrationCount: 7 },
      { practitioner: 'James O’Connor', siteName: 'Watford', registrationCount: 2 },
      { practitioner: 'Grace Ahmed', siteName: 'Truro', registrationCount: 8 },
      { practitioner: 'Daniel Roberts', siteName: 'Truro', registrationCount: 1 },
      { practitioner: 'Sophie Nguyen', siteName: 'Truro', registrationCount: 6 },
      { practitioner: 'Liam Gallagher', siteName: 'Truro', registrationCount: 4 },
      { practitioner: 'Priya Desai', siteName: 'Workington', registrationCount: 9 },
      { practitioner: 'Marcus Wright', siteName: 'Workington', registrationCount: 3 },
      { practitioner: 'Emily Johnson', siteName: 'Workington', registrationCount: 2 },
      { practitioner: 'Tom Richardson', siteName: 'Workington', registrationCount: 7 },
      { practitioner: 'Aisha Khan', siteName: 'Stains', registrationCount: 10 },
      { practitioner: 'Matthew Price', siteName: 'Stains', registrationCount: 5 },
      { practitioner: 'Charlotte Evans', siteName: 'Stains', registrationCount: 6 },
      { practitioner: 'William Scott', siteName: 'Stains', registrationCount: 2 },
      { practitioner: 'Isabel Turner', siteName: 'Stains', registrationCount: 4 },
      { practitioner: 'Benjamin Hall', siteName: 'Stains', registrationCount: 7 },
      { practitioner: 'Rachel Lewis', siteName: 'Stains', registrationCount: 3 },
      { practitioner: 'Ethan Morgan', siteName: 'Stains', registrationCount: 6 },
    ]
  }
}
