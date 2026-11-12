// Initialise telemetry before anything else to allow for instrumentation of bunyan and express
import { shutdownTelemetry } from './server/utils/telemetry'

import app from './server/index'
import logger from './logger'
import gracefulShutdown from './server/utils/gracefulShutdown'
import 'source-map-support/register'

const server = app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

// Registering a SIGTERM listener replaces Node's default termination, so this handler is solely responsible for exiting.
process.once('SIGTERM', () => {
  gracefulShutdown(server, shutdownTelemetry).finally(() => process.exit(0))
})
