import EsupervisionApiClient from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'

import LocationInfo from '../data/models/locationInfo'

import OffenderInfo from '../data/models/offenderInfo'
import OffenderSetup from '../data/models/offenderSetup'
import CheckinSubmission from '../data/models/checkinSubmission'
import CreateCheckinRequest from '../data/models/createCheckinRequest'

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

  getOffenders(): Promise<Page<OffenderInfo>> {
    return this.esupervisionApiClient.getOffenders()
  }

  submitCheckin(checkinId: string, submission: CheckinSubmission): Promise<Checkin> {
    return this.esupervisionApiClient.submitCheckin(checkinId, submission)
  }

  createOffender(offenderInfo: OffenderInfo): Promise<OffenderSetup> {
    return this.esupervisionApiClient.createOffender(offenderInfo)
  }

  createCheckin(checkin: CreateCheckinRequest): Promise<Checkin> {
    return this.esupervisionApiClient.createCheckin(checkin)
  }
}
