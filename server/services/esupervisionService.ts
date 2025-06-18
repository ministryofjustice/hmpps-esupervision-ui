import EsupervisionApiClient from '../data/esupervisionApiClient'

export default class EsupervisionService {
  constructor(private readonly esupervisionApiClient: EsupervisionApiClient) {}

  getCurrentTime() {
    return this.esupervisionApiClient.getCurrentTime()
  }
}
