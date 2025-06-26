import EsupervisionApiClient from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'
import LocationInfo from '../data/models/locationInfo'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCheckins(): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins()
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
}
