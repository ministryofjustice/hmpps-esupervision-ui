import { dataAccess } from '../data'
import AuditService from './auditService'
import EsupervisionService from './esupervisionService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, esupervisionApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    esupervisionService: new EsupervisionService(esupervisionApiClient),
  }
}

export type Services = ReturnType<typeof services>
