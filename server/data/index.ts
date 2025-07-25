/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { RekognitionClient } from '@aws-sdk/client-rekognition'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import EsupervisionApiClient from './esupervisionApiClient'

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  const rekognitionClient = new RekognitionClient({
    region: config.apis.rekognitionApi.region,
    credentials: {
      accessKeyId: config.apis.rekognitionApi.accessKeyId,
      secretAccessKey: config.apis.rekognitionApi.secretAccessKey,
    },
  })

  return {
    applicationInfo,
    hmppsAuthClient,
    esupervisionApiClient: new EsupervisionApiClient(hmppsAuthClient),
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
    rekognitionClient,
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { AuthenticationClient, HmppsAuditClient, EsupervisionApiClient, RekognitionClient }
