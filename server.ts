// Initialise telemetry before anything else to allow for instrumentation of bunyan and express
import { shutdownTelemetry } from './server/utils/telemetry'

import app from './server/index'
import logger from './logger'
import 'source-map-support/register'

const server = app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

/*
 * Registering a SIGTERM listener replaces Node's default termination, so this handler is solely
 * responsible for exiting. Stop listening first so the port is released straight away (e.g. for the
 * dev watcher's replacement process), then flush telemetry, which may take a while.
 */
process.once('SIGTERM', () => {
  server.close()
  shutdownTelemetry().finally(() => process.exit(0))
})
