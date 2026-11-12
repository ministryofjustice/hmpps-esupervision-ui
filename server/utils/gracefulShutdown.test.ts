import http, { type Server } from 'http'
import type { AddressInfo } from 'net'
import gracefulShutdown from './gracefulShutdown'

jest.mock('../../logger')

const startServer = (handler: http.RequestListener): Promise<Server> =>
  new Promise(resolve => {
    const server = http.createServer(handler)
    server.listen(0, () => resolve(server))
  })

const request = (server: Server): Promise<string> =>
  new Promise((resolve, reject) => {
    const { port } = server.address() as AddressInfo
    http
      .get(`http://localhost:${port}`, res => {
        res.resume()
        res.on('end', () => resolve('completed'))
      })
      .on('error', () => resolve('aborted'))
      .on('timeout', reject)
  })

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
    const inFlight = request(server)
    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })

    const shutdown = gracefulShutdown(server, async () => {
      events.push('telemetry flushed')
    })
    expect(server.listening).toBe(false)

    finishRequest()
    await shutdown

    expect(await inFlight).toEqual('completed')
    expect(events).toEqual(['request finished', 'telemetry flushed'])
  })

  it('stops waiting for requests after the drain timeout and still flushes telemetry', async () => {
    const server = await startServer(() => {
      // never responds
    })
    const inFlight = request(server)
    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })
    const flushTelemetry = jest.fn().mockResolvedValue(undefined)

    await gracefulShutdown(server, flushTelemetry, 100)

    expect(flushTelemetry).toHaveBeenCalled()
    expect(await inFlight).toEqual('aborted')
  })
})
