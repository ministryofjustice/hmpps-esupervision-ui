/* eslint-disable @typescript-eslint/no-explicit-any */
import { hoursToHoursAndMinutes, renderV2stats } from './v2statisticsController'
import { services } from '../services'
import { V2StatsWithFeedback } from '../data/models/v2stats'

jest.mock('../services')

const mockGetV2Stats = jest.fn()

;(services as jest.Mock).mockReturnValue({
  esupervisionService: {
    getV2Stats: mockGetV2Stats,
  },
})

const v2statsWithFeedback: V2StatsWithFeedback = {
  totalSignedUp: 10,
  activeUsers: 7,
  inactiveUsers: 3,
  completedCheckins: 4,
  notCompletedOnTime: 1,
  avgHoursToComplete: 1.5,
  avgCompletedCheckinsPerPerson: 2.86,
  updatedAt: '2026-01-28T12:02:00.020175Z',
  pctActiveUsers: 0.6,
  pctInactiveUsers: 0.4,
  pctCompletedCheckins: 0.9,
  pctExpiredCheckins: 0.1,
  feedbackTotal: 5,
  howEasyCounts: { easy: 1, veryEasy: 2, notAnswered: 2 },
  howEasyPct: { easy: 0.3333, veryEasy: 0.6667 },
  gettingSupportCounts: { no: 1, yes: 2, notAnswered: 2 },
  gettingSupportPct: { no: 0.3333, yes: 0.6667 },
  improvementsCounts: {
    gettingHelp: 1,
    notAnswered: 2,
    takingAVideo: 1,
    somethingElse: 1,
    checkInQuestions: 1,
    nothingNeedsImproving: 1,
    beingSignedUpToCheckIns: 2,
    findingOutAboutCheckIns: 2,
    textOrEmailNotifications: 1,
    whatHappenedAfterAskingForContact: 1,
    whatHappenedAfterAskingForSupport: 1,
  },
  improvementsPct: {
    gettingHelp: 0.3333,
    takingAVideo: 0.3333,
    somethingElse: 0.3333,
    checkInQuestions: 0.3333,
    nothingNeedsImproving: 0.3333,
    beingSignedUpToCheckIns: 0.6667,
    findingOutAboutCheckIns: 0.6667,
    textOrEmailNotifications: 0.3333,
    whatHappenedAfterAskingForContact: 0.3333,
    whatHappenedAfterAskingForSupport: 0.3333,
  },
}

describe('v2statisticsController', () => {
  describe('hoursToHoursAndMinutes', () => {
    it('converts whole hours correctly', () => {
      expect(hoursToHoursAndMinutes(2)).toBe('2h 0m')
    })

    it('converts fractional hours correctly', () => {
      expect(hoursToHoursAndMinutes(1.5)).toBe('1h 30m')
    })

    it('rounds minutes correctly', () => {
      expect(hoursToHoursAndMinutes(1.333)).toBe('1h 20m')
    })

    it('handles zero', () => {
      expect(hoursToHoursAndMinutes(0)).toBe('0h 0m')
    })
  })

  describe('renderV2stats', () => {
    const mockReq = {} as any
    const mockNext = jest.fn()

    const mockRes = {
      render: jest.fn(),
    } as any

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders dashboard with stats and percentages', async () => {
      mockGetV2Stats.mockResolvedValue({
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
      })

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          date: '28/01/2026',
          feedbackStats: {
            feedbackTotal: 0,
          },
          hideFeedbackLink: true,
          stats: {
            activeUsers: 7,
            avgCompletedCheckinsPerPerson: 2.86,
            avgHoursToComplete: '1h 30m',
            completedCheckins: 4,
            inactiveUsers: 3,
            notCompletedOnTime: 1,
            pctActiveUsers: 0.7,
            pctCompletedCheckins: 0.9091,
            pctExpiredCheckins: 0.0909,
            pctInactiveUsers: 0.3,
            totalSignedUp: 10,
            updatedAt: '2026-01-28T12:02:00.020175Z',
          },
          time: '12:02:00 PM',
        }),
      )

      expect(mockNext).not.toHaveBeenCalled()
    })

    it('renders dashboard with stats and percentages including feedback data', async () => {
      mockGetV2Stats.mockResolvedValue(v2statsWithFeedback)

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          date: '28/01/2026',
          feedbackStats: {
            feedbackTotal: 5,
            gettingSupportCounts: { no: 1, notAnswered: 2, yes: 2 }, // These objects do not need to have all the keys as they are defaulted in njk
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
          hideFeedbackLink: true,
          stats: {
            activeUsers: 7,
            avgCompletedCheckinsPerPerson: 2.86,
            avgHoursToComplete: '1h 30m',
            completedCheckins: 4,
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
            inactiveUsers: 3,
            notCompletedOnTime: 1,
            pctActiveUsers: 0.6,
            pctCompletedCheckins: 0.9,
            pctExpiredCheckins: 0.1,
            pctInactiveUsers: 0.4,
            totalSignedUp: 10,
            updatedAt: '2026-01-28T12:02:00.020175Z',
          },
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
