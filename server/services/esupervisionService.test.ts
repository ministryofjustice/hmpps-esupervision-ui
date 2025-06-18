import EsupervisionApiClient from '../data/esupervisionApiClient'
import EsupervisionService from './esupervisionService'

jest.mock('../data/esupervisionApiClient')

describe('EsupervisionService', () => {
  const esupervisionApiClient = new EsupervisionApiClient(null) as jest.Mocked<EsupervisionApiClient>
  let esupervisionService: EsupervisionService

  beforeEach(() => {
    esupervisionService = new EsupervisionService(esupervisionApiClient)
  })

  it('should call getCurrentTime on the api client and return its result', async () => {
    const expectedTime = '2025-01-01T12:00:00Z'

    esupervisionApiClient.getCurrentTime.mockResolvedValue(expectedTime)

    const result = await esupervisionService.getCurrentTime()

    expect(esupervisionApiClient.getCurrentTime).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedTime)
  })
})
