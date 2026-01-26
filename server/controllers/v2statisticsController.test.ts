/* eslint-disable @typescript-eslint/no-explicit-any */
import { hoursToHoursAndMinutes, getUserPercentages, renderV2stats } from './v2statisticsController'
import V2Stats from '../data/models/v2stats'
import { services } from '../services'

jest.mock('../services')

const mockGetV2Stats = jest.fn()

;(services as jest.Mock).mockReturnValue({
  esupervisionService: {
    getV2Stats: mockGetV2Stats,
  },
})

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

  describe('getUserPercentages', () => {
    const baseStats: V2Stats = {
      totalSignedUp: 100,
      activeUsers: 60,
      inactiveUsers: 40,
      completedCheckins: 75,
      notCompletedOnTime: 25,
      avgHoursToComplete: 1.5,
      avgCompletedCheckinsPerPerson: 1,
    }

    it('calculates percentages correctly', () => {
      const result = getUserPercentages(baseStats)

      expect(result).toEqual({
        activeUsers: '60%',
        inactiveUsers: '40%',
        completedCheckins: '75%',
        notCompletedCheckins: '25%',
      })
    })

    it('returns 0% when totalSignedUp is zero', () => {
      const result = getUserPercentages({
        ...baseStats,
        totalSignedUp: 0,
        activeUsers: 0,
        inactiveUsers: 0,
      })

      expect(result.activeUsers).toBe('0%')
      expect(result.inactiveUsers).toBe('0%')
    })

    it('returns 0% when totalCheckins is zero', () => {
      const result = getUserPercentages({
        ...baseStats,
        completedCheckins: 0,
        notCompletedOnTime: 0,
      })

      expect(result.completedCheckins).toBe('0%')
      expect(result.notCompletedCheckins).toBe('0%')
    })

    it('formats percentages to 2 decimal places', () => {
      const result = getUserPercentages({
        ...baseStats,
        activeUsers: 1,
        inactiveUsers: 2,
        totalSignedUp: 3,
      })

      expect(result.activeUsers).toBe('33.33%')
      expect(result.inactiveUsers).toBe('66.67%')
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
      })

      await renderV2stats(mockReq, mockRes, mockNext)

      expect(mockRes.render).toHaveBeenCalledWith(
        'pages/v2statistics/dashboard',
        expect.objectContaining({
          stats: expect.objectContaining({
            avgHoursToComplete: '1h 30m',
          }),
          percentages: {
            activeUsers: '70%',
            inactiveUsers: '30%',
            completedCheckins: '80%',
            notCompletedCheckins: '20%',
          },
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
