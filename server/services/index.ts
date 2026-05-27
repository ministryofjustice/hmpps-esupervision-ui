import { dataAccess } from '../data'
import AuditService from './auditService'
import EsupervisionService from './esupervisionService'
import PopService from './popService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, esupervisionApiClient, popApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    esupervisionService: new EsupervisionService(esupervisionApiClient),
    popService: new PopService(popApiClient),
  }
}

export type Services = ReturnType<typeof services>
