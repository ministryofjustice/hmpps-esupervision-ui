import { dataAccess } from '../data'
import AuditService from './auditService'
import EsupervisionService from './esupervisionService'
import FaceCompareService from './faceCompareService'
import config from '../config'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, esupervisionApiClient, rekognitionClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    esupervisionService: new EsupervisionService(esupervisionApiClient),
    faceCompareService: new FaceCompareService(rekognitionClient, config.apis.rekognitionApi),
  }
}

export type Services = ReturnType<typeof services>
