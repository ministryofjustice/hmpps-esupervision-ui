import EsupervisionApiClient from '../data/esupervisionApiClient'
import Page from '../data/models/page'
import Checkin from '../data/models/checkin'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCurrentTime() {
    return this.esupervisionApiClient.getCurrentTime()
  }

  getCheckins(practitionerId: string): Promise<Page<Checkin>> {
    return this.esupervisionApiClient.getCheckins(practitionerId)
  }
}
