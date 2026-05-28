/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderV2stats, renderV2statsByProvider } from './v2statisticsController'
import { services } from '../services'
import { V2StatsResponse } from '../data/models/v2stats'

jest.mock('../services')

const mockGetV2StatsBetweenDateRange = jest.fn()

;(services as jest.Mock).mockReturnValue({
  esupervisionService: {
    getV2StatsBetweenDateRange: mockGetV2StatsBetweenDateRange,
  },
})

describe('v2statisticsController', () => {
  const v2stats: V2StatsResponse = {
    total: {
      signedUp: 10,
      activeUsers: 7,
      inactiveUsers: 3,
      completedCheckins: 4,
      notCompletedOnTime: 1,
      avgHoursToComplete: 1.5,
      avgCompletedCheckinsPerPerson: 2.86,
      updatedAt: '2026-01-28T12:02:00.020175Z',
      pctActiveUsers: 0.7,
      pctInactiveUsers: 0.3,
      pctCompletedCheckins: 0.9091,
      pctExpiredCheckins: 0.0909,
      feedbackTotal: 5,
      gettingSupportCounts: { no: 1, notAnswered: 2, yes: 2 },
      gettingSupportPct: { no: 0.3333, yes: 0.6667 },
      howEasyCounts: { easy: 1, notAnswered: 2, veryEasy: 2 },
      howEasyPct: { easy: 0.3333, veryEasy: 0.6667 },
      improvementsCounts: {
        beingSignedUpToCheckIns: 2,
        checkInQuestions: 1,
        findingOutAboutCheckIns: 2,
        gettingHelp: 1,
        notAnswered: 2,
        nothingNeedsImproving: 1,
        somethingElse: 1,
        takingAVideo: 1,
        textOrEmailNotifications: 1,
        whatHappenedAfterAskingForContact: 1,
        whatHappenedAfterAskingForSupport: 1,
      },
      improvementsPct: {
        beingSignedUpToCheckIns: 0.6667,
        checkInQuestions: 0.3333,
        findingOutAboutCheckIns: 0.6667,
        gettingHelp: 0.3333,
        nothingNeedsImproving: 0.3333,
        somethingElse: 0.3333,
        takingAVideo: 0.3333,
        textOrEmailNotifications: 0.3333,
        whatHappenedAfterAskingForContact: 0.3333,
        whatHappenedAfterAskingForSupport: 0.3333,
      },
    },
    providers: [
      {
        providerCode: 'ALLUAT',
        providerDescription: 'Unallocated',
        signedUp: 2,
        activeUsers: 2,
        inactiveUsers: 0,
        completedCheckins: 1,
        notCompletedOnTime: 2,
        avgHoursToComplete: 1.92,
        avgCompletedCheckinsPerPerson: 1,
        pctActiveUsers: 1,
        pctInactiveUsers: 0,
        pctCompletedCheckins: 0.3333,
        pctExpiredCheckins: 0.6667,
        pctSignedUpOfTotal: 0.0112,
        updatedAt: '2026-02-20T13:50:25.032606Z',
      },
      {
        providerCode: 'FAKEPROVIDER',
        providerDescription: 'Fakeville',
        signedUp: 33,
        activeUsers: 30,
        inactiveUsers: 3,
        completedCheckins: 12,
        notCompletedOnTime: 4,
        avgHoursToComplete: 0.5,
        avgCompletedCheckinsPerPerson: 2,
        pctActiveUsers: 4,
        pctInactiveUsers: 4,
        pctCompletedCheckins: 0.3333,
        pctExpiredCheckins: 0.6667,
        pctSignedUpOfTotal: 0.0112,
        updatedAt: '2026-02-20T13:50:25.032606Z',
      },
    ],
  }

  const updatedAt = new Date(v2stats.total.updatedAt as string)
  const expectedDate = updatedAt.toLocaleDateString('en-GB')
  const expectedTime = updatedAt.toLocaleTimeString()

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-02-15T10:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('renderV2stats', () => {
    const mockNext = jest.fn()

    const mockRes = {
      render: jest.fn(),
    } as any

    it('defaults monthFrom to Aug 2025, monthTo to current month, fetches date-range stats, and renders dashboard with real month options', async () => {
      const mockReq = { query: {} } as any
      mockGetV2StatsBetweenDateRange.mockResolvedValue(v2stats)

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockGetV2StatsBetweenDateRange).toHaveBeenCalledWith('2025-08', '2026-03')

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          date: expectedDate,
          time: expectedTime,
          hideFeedbackLink: true,
          monthFrom: '2025-08',
          monthTo: '2026-02',
          fromMonthOptions: expect.any(Array), // Asserted properly below
          toMonthOptions: expect.any(Array),
          stats: v2stats.total,
          feedbackStats: {
            feedbackTotal: 5,
            gettingSupportCounts: v2stats.total.gettingSupportCounts,
            gettingSupportPct: v2stats.total.gettingSupportPct,
            howEasyCounts: v2stats.total.howEasyCounts,
            howEasyPct: v2stats.total.howEasyPct,
            improvementsCounts: v2stats.total.improvementsCounts,
            improvementsPct: v2stats.total.improvementsPct,
          },
        }),
      )

      const props = (mockRes.render as jest.Mock).mock.calls[0][1]

      expect(props.fromMonthOptions).toHaveLength(7)
      expect(props.toMonthOptions).toHaveLength(7)

      expect(props.fromMonthOptions[0]).toEqual(
        expect.objectContaining({ value: '2025-08', text: 'August 2025', selected: true }),
      )
      expect(props.fromMonthOptions[1]).toEqual(
        expect.objectContaining({ value: '2025-09', text: 'September 2025', selected: false }),
      )
      expect(props.toMonthOptions[6]).toEqual(
        expect.objectContaining({ value: '2026-02', text: 'February 2026', selected: true }),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('uses monthFrom/monthTo from query, and calls one-month service when monthFrom === monthTo', async () => {
      const mockReq = { query: { monthFrom: '2026-01', monthTo: '2026-01' } } as any

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockGetV2StatsBetweenDateRange).toHaveBeenCalledWith('2026-01', '2026-02')

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          monthFrom: '2026-01',
          monthTo: '2026-01',
          stats: v2stats.total,
          feedbackStats: expect.any(Object),
        }),
      )

      const renderArg = (mockRes.render as jest.Mock).mock.calls[0][1]
      expect(renderArg.fromMonthOptions).toEqual(
        expect.arrayContaining([expect.objectContaining({ value: '2026-01', text: 'January 2026', selected: true })]),
      )
      expect(renderArg.toMonthOptions).toEqual(
        expect.arrayContaining([expect.objectContaining({ value: '2026-01', text: 'January 2026', selected: true })]),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("renders validation error when 'From' month is after 'To' month, and does not call the service", async () => {
      const mockReq = { query: { monthFrom: '2026-03', monthTo: '2026-02' } } as any

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockGetV2StatsBetweenDateRange).not.toHaveBeenCalled()

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          hideFeedbackLink: true,
          fromMonthOptions: expect.any(Array),
          toMonthOptions: expect.any(Array),
          errors: {
            monthRange: "The 'From' month must be before the 'To' month",
          },
        }),
      )

      const renderArg = (mockRes.render as jest.Mock).mock.calls[0][1]
      expect(renderArg.fromMonthOptions).toEqual(
        expect.arrayContaining([expect.objectContaining({ value: '2026-02', text: 'February 2026' })]),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('calls next with error when service throws', async () => {
      const mockReq = { query: { monthFrom: '2025-08', monthTo: '2026-02' } } as any
      const error = new Error('Boom')

      mockGetV2StatsBetweenDateRange.mockRejectedValue(error)

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockRes.render).not.toHaveBeenCalled()
    })
  })

  describe('renderV2statsByProvider', () => {
    const mockNext = jest.fn()

    const mockRes = {
      render: jest.fn(),
    } as any

    it('uses query months, fetches stats, and renders provider dashboard with totals + providerStats', async () => {
      const mockReq = { query: { monthFrom: '2025-08', monthTo: '2026-02' } } as any
      mockGetV2StatsBetweenDateRange.mockResolvedValue(v2stats)

      await renderV2statsByProvider(mockReq, mockRes, mockNext)

      expect(mockGetV2StatsBetweenDateRange).toHaveBeenCalledWith('2025-08', '2026-03')

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/providerDashboard',
        expect.objectContaining({
          date: expectedDate,
          time: expectedTime,
          hideFeedbackLink: true,
          monthFrom: mockReq.query.monthFrom,
          monthTo: mockReq.query.monthTo,
          fromMonthOptions: expect.any(Array),
          toMonthOptions: expect.any(Array),
          totalStats: v2stats.total,
          providerStats: v2stats.providers,
        }),
      )

      const renderArg = (mockRes.render as jest.Mock).mock.calls[0][1]
      expect(renderArg.fromMonthOptions).toHaveLength(7)
      expect(renderArg.toMonthOptions).toHaveLength(7)

      expect(mockNext).not.toHaveBeenCalled()
    })

    it("renders validation error when 'From' month is after 'To' month, and does not call the service", async () => {
      const mockReq = { query: { monthFrom: '2026-03', monthTo: '2026-02' } } as any

      await renderV2statsByProvider(mockReq, mockRes, mockNext)

      expect(mockGetV2StatsBetweenDateRange).not.toHaveBeenCalled()

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/providerDashboard',
        expect.objectContaining({
          hideFeedbackLink: true,
          fromMonthOptions: expect.any(Array),
          toMonthOptions: expect.any(Array),
          errors: {
            monthRange: "The 'From' month must be before the 'To' month",
          },
        }),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('calls next with error when service throws', async () => {
      const mockReq = { query: { monthFrom: '2025-08', monthTo: '2026-02' } } as any
      const error = new Error('Boom')

      mockGetV2StatsBetweenDateRange.mockRejectedValue(error)

      await renderV2statsByProvider(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockRes.render).not.toHaveBeenCalled()
    })
  })
})
