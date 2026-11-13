import type { Server } from 'http'
import type { Socket } from 'net'
import logger from '../../logger'

/*
 * Kubernetes sends SIGKILL 30s after SIGTERM by default, so the request drain and the telemetry flush
 * (whose own backstop is in telemetry.ts) must fit within that together.
 */
export const DRAIN_TIMEOUT_MS = 10_000

const IDLE_CHECK_INTERVAL_MS = 100

// Backstop in case a forcibly closed socket never emits 'close'
const FORCED_CLOSE_TIMEOUT_MS = 1_000

/**
 * Tracks the server's connections and returns a shutdown function which stops accepting connections (releasing
 * the port straight away), waits for in-flight requests to finish so their spans end and are flushed, then flushes
 * telemetry. If requests are still running after drainTimeoutMs, their connections are closed and shutdown
 * carries on once the sockets' close handling (which ends the aborted requests' spans) has run.
 */
export default function enableGracefulShutdown(
  server: Server,
  flushTelemetry: () => Promise<void>,
  drainTimeoutMs: number = DRAIN_TIMEOUT_MS,
): () => Promise<void> {
  const sockets = new Set<Socket>()
  server.on('connection', (socket: Socket) => {
    sockets.add(socket)
    socket.once('close', () => sockets.delete(socket))
  })

  const forceCloseConnections = (): Promise<void> => {
    // The server's close callback fires as soon as sockets are destroyed, before their 'close' events (and so the
    // request/response close handlers) run. Listeners added now run after those handlers, so wait for them instead.
    const closed = [...sockets].map(
      socket =>
        new Promise<void>(resolve => {
          socket.once('close', () => resolve())
        }),
    )
    server.closeAllConnections()
    return Promise.race([
      Promise.all(closed).then((): void => undefined),
      new Promise<void>(resolve => {
        setTimeout(resolve, FORCED_CLOSE_TIMEOUT_MS).unref()
      }),
    ])
  }

  return () => {
    const drained = new Promise<void>(resolve => {
      // Keep-alive connections become idle once their response is sent, but would otherwise hold close() open until
      // the keep-alive timeout, so keep closing idle ones until the drain completes.
      const closeIdle = setInterval(() => server.closeIdleConnections(), IDLE_CHECK_INTERVAL_MS)
      closeIdle.unref()

      let forcingClose = false
      const timer = setTimeout(() => {
        logger.warn(`Requests still in flight after ${drainTimeoutMs}ms, closing their connections`)
        forcingClose = true
        clearInterval(closeIdle)
        forceCloseConnections().then(resolve)
      }, drainTimeoutMs)
      timer.unref()

      server.close(() => {
        // Once connections are being forced closed, forceCloseConnections decides when the drain is done
        if (forcingClose) return
        clearTimeout(timer)
        clearInterval(closeIdle)
        resolve()
      })
      server.closeIdleConnections()
    })

    return drained.then(flushTelemetry)
  }
}
