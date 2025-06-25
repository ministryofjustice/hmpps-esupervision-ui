import EsupervisionApiClient from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'
import OffenderInfo from '../data/models/offenderInfo'
import OffenderSetup from '../data/models/offenderSetup'
import CheckinSubmission from '../data/models/checkinSubmission'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCheckins(practitionerUuid: string): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins(practitionerUuid)
  }

  getCheckin(submissionId: string): Promise<Checkin> {
    return this.esupervisionApiClient.getCheckin(submissionId)
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
}
