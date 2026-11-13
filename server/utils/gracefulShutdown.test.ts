import http, { type Server } from 'http'
import type { AddressInfo } from 'net'
import { once } from 'events'
import enableGracefulShutdown from './gracefulShutdown'

jest.mock('../../logger')

const startServer = (handler: http.RequestListener): Promise<Server> =>
  new Promise(resolve => {
    const server = http.createServer(handler)
    server.listen(0, () => resolve(server))
  })

// Resolves once the server has received the request, so shutdown starts with it genuinely in flight
const sendRequest = async (server: Server): Promise<{ outcome: Promise<string> }> => {
  const received = once(server, 'request')
  const { port } = server.address() as AddressInfo
  const outcome = new Promise<string>((resolve, reject) => {
    http
      .get(`http://localhost:${port}`, res => {
        res.resume()
        res.on('end', () => resolve('completed'))
      })
      .on('error', () => resolve('aborted'))
      .on('timeout', reject)
  })
  await received
  return { outcome }
}

describe('gracefulShutdown', () => {
  it('waits for in-flight requests to finish before flushing telemetry', async () => {
    const events: string[] = []
    let finishRequest: () => void
    const server = await startServer((_req, res) => {
      finishRequest = () => {
        events.push('request finished')
        res.end('ok')
      }
    })
    const shutdown = enableGracefulShutdown(server, async () => {
      events.push('telemetry flushed')
    })
    const { outcome } = await sendRequest(server)

    const shuttingDown = shutdown()
    expect(server.listening).toBe(false)

    finishRequest()
    await shuttingDown

    expect(await outcome).toEqual('completed')
    expect(events).toEqual(['request finished', 'telemetry flushed'])
  })

  it('after the drain timeout, closes connections and runs their close handlers before flushing telemetry', async () => {
    const events: string[] = []
    const server = await startServer((_req, res) => {
      // never responds
      res.on('close', () => events.push('response closed'))
    })
    const shutdown = enableGracefulShutdown(
      server,
      async () => {
        events.push('telemetry flushed')
      },
      100,
    )
    const { outcome } = await sendRequest(server)

    await shutdown()

    expect(await outcome).toEqual('aborted')
    expect(events).toEqual(['response closed', 'telemetry flushed'])
  })
})
