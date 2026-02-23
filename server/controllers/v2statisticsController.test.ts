/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderV2stats, renderV2statsByPdu } from './v2statisticsController'
import { services } from '../services'
import { V2StatsResponse, V2StatsWithFeedback } from '../data/models/v2stats'

jest.mock('../services')

const mockGetV2Stats = jest.fn()

;(services as jest.Mock).mockReturnValue({
  esupervisionService: {
    getV2Stats: mockGetV2Stats,
  },
})

describe('v2statisticsController', () => {
  const v2stats: V2StatsResponse = {
    total: {
      totalSignedUp: 10,
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
    pdus: [
      {
        pduCode: 'ALLUAT',
        pduDescription: 'Unallocated',
        totalSignedUp: 2,
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
        pduCode: 'FAKEPDU',
        pduDescription: 'Fakeville',
        totalSignedUp: 33,
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

  describe('renderV2stats', () => {
    const mockReq = {} as any
    const mockNext = jest.fn()

    const mockRes = {
      render: jest.fn(),
    } as any

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('separates out the feedback stats, and passes it to the page in a separate key', async () => {
      mockGetV2Stats.mockResolvedValue(v2stats)

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          date: '28/01/2026',
          feedbackStats: {
            feedbackTotal: 5,
            gettingSupportCounts: v2stats.total.gettingSupportCounts,
            gettingSupportPct: v2stats.total.gettingSupportPct,
            howEasyCounts: v2stats.total.howEasyCounts,
            howEasyPct: v2stats.total.howEasyPct,
            improvementsCounts: v2stats.total.improvementsCounts,
            improvementsPct: v2stats.total.improvementsPct,
          },
          hideFeedbackLink: true,
          stats: v2stats.total,
          time: '12:02:00 PM',
        }),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('calls next with error when service throws', async () => {
      const error = new Error('Boom')
      mockGetV2Stats.mockRejectedValue(error)

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockRes.render).not.toHaveBeenCalled()
    })
  })

  describe('renderV2statsByPdu', () => {
    const mockReq = {} as any
    const mockNext = jest.fn()

    const mockRes = {
      render: jest.fn(),
    } as any

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('separates out the pdu stats, and passes it to the page in a separate key', async () => {
      mockGetV2Stats.mockResolvedValue(v2stats)

      await renderV2statsByPdu(mockReq, mockRes, mockNext)

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/pduDashboard',
        expect.objectContaining({
          date: '28/01/2026',
          totalStats: v2stats.total,
          pduStats: v2stats.pdus,
          hideFeedbackLink: true,
          time: '12:02:00 PM',
        }),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('calls next with error when service throws', async () => {
      const error = new Error('Boom')
      mockGetV2Stats.mockRejectedValue(error)

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(error)
      expect(mockRes.render).not.toHaveBeenCalled()
    })
  })
})
