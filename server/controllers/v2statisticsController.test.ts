/* eslint-disable @typescript-eslint/no-explicit-any */
import { hoursToHoursAndMinutes, renderV2stats } from './v2statisticsController'
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
          date: '1/28/2026',
          time: '12:02:00 PM',
          percentages: {
            activeUsers: '70.00%',
            completedCheckins: '90.91%',
            inactiveUsers: '30.00%',
            notCompletedCheckins: '9.09%',
          },
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
