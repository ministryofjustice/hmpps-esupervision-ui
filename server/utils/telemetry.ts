/*
 * Telemetry has to be initialised before any other application module is loaded, so that
 * OpenTelemetry can instrument express, http and bunyan as they are required. This module is
 * therefore imported first in server.ts, and deliberately imports nothing that would pull in
 * those modules early - notably config, which loads http via the rest client.
 *
 * The instrumentations patch http, express and bunyan when @ministryofjustice/hmpps-azure-telemetry
 * is *loaded*, not when startRecording() is called. A static import would therefore patch those
 * modules even in environments with no connection string, where applicationinsights used to leave
 * them untouched. The package is required lazily behind the check below so that telemetry stays
 * entirely inert when it is switched off.
 */
import type { RequestHandler } from 'express'
import applicationName from '../applicationName'

type TelemetryModule = typeof import('@ministryofjustice/hmpps-azure-telemetry')

const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
const debug = process.env.DEBUG_TELEMETRY === 'true'

// How long to wait for the shutdown flush before exiting regardless.
const FLUSH_TIMEOUT_MS = 5_000

let userMetadataMiddleware: RequestHandler = (_req, _res, next) => next()

if (connectionString || debug) {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports, global-require --
   * Deliberately lazy: a static import would patch http, express and bunyan even when telemetry
   * is switched off. See the note at the top of this file. */
  const telemetryModule = require('@ministryofjustice/hmpps-azure-telemetry') as TelemetryModule
  const { flushTelemetry, initialiseTelemetry, telemetry, telemetryMiddleware } = telemetryModule

  initialiseTelemetry({
    serviceName: applicationName,
    serviceVersion: process.env.BUILD_NUMBER,
    connectionString,
    debug,
  })
    .addFilter(telemetry.processors.filterSpanWherePath(['/health', '/info', '/ping', '/assets/*', '/favicon.ico']))
    // Replaces the operation name override that used to be applied by an express middleware,
    // turning 'GET' into e.g. 'GET /cases/:offenderId'
    .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
    .startRecording()

  // Tags the request span with res.locals.user.userId and res.locals.user.userUuid
  userMetadataMiddleware = telemetryMiddleware.addUserMetadataToTelemetry()

  process.on('SIGTERM', () => {
    /*
     * Registering a SIGTERM listener replaces Node's default termination, so this handler is now
     * solely responsible for exiting. A rejection or a flush that hangs on the network must not
     * leave the process alive until the container runtime resorts to SIGKILL - hence both the
     * catch and the timeout.
     */
    const flushed = Promise.resolve()
      .then(() => flushTelemetry())
      .catch(error => console.error('Telemetry: flush failed during shutdown', error)) // eslint-disable-line no-console

    const timedOut = new Promise<void>(resolve => {
      setTimeout(() => {
        console.error(`Telemetry: flush did not complete within ${FLUSH_TIMEOUT_MS}ms, exiting anyway`) // eslint-disable-line no-console
        resolve()
      }, FLUSH_TIMEOUT_MS).unref()
    })

    Promise.race([flushed, timedOut]).finally(() => process.exit(0))
  })
}

/**
 * Adds the logged in user's ids to the current request's telemetry. Must run after
 * res.locals.user has been populated from the user token. A no-op when telemetry is switched off.
 */
export default function addUserMetadataToTelemetry(): RequestHandler {
  return (req, res, next) => userMetadataMiddleware(req, res, next)
}
