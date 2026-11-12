import type { Server } from 'http'
import logger from '../../logger'

/*
 * Kubernetes sends SIGKILL 30s after SIGTERM by default, so the request drain and the telemetry flush
 * (whose own backstop is in telemetry.ts) must fit within that together.
 */
export const DRAIN_TIMEOUT_MS = 10_000

const IDLE_CHECK_INTERVAL_MS = 100

/**
 * Stops accepting connections (releasing the port straight away), waits for in-flight requests to finish
 * so their spans end and are flushed, then flushes telemetry. Resolves once both are done; if requests
 * are still running after drainTimeoutMs, their connections are closed and shutdown carries on.
 */
export default function gracefulShutdown(
  server: Server,
  flushTelemetry: () => Promise<void>,
  drainTimeoutMs: number = DRAIN_TIMEOUT_MS,
): Promise<void> {
  const drained = new Promise<void>(resolve => {
    // Keep-alive connections become idle once their response is sent, but would otherwise hold close() open until
    // the keep-alive timeout, so keep closing idle ones until the drain completes.
    const closeIdle = setInterval(() => server.closeIdleConnections(), IDLE_CHECK_INTERVAL_MS)
    closeIdle.unref()

    const timer = setTimeout(() => {
      logger.warn(`Requests still in flight after ${drainTimeoutMs}ms, closing their connections`)
      clearInterval(closeIdle)
      server.closeAllConnections()
      resolve()
    }, drainTimeoutMs)
    timer.unref()

    server.close(() => {
      clearTimeout(timer)
      clearInterval(closeIdle)
      resolve()
    })
    server.closeIdleConnections()
  })

  return drained.then(flushTelemetry)
}
