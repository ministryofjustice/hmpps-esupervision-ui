import { RequestHandler } from 'express'
import { services } from '../services'
import V2Stats from '../data/models/v2stats'

export function hoursToHoursAndMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  return `${h}h ${m}m`
}

const formatToPercentage = (decimal: number): string => `${(decimal * 100).toFixed(2)}%`

export const renderV2stats: RequestHandler = async (req, res, next) => {
  try {
    const { esupervisionService } = services()
    const v2stats: V2Stats = await esupervisionService.getV2Stats()
    const { pctActiveUsers, pctInactiveUsers, pctCompletedCheckins, pctExpiredCheckins, updatedAt } = v2stats
    const percentages = {
      activeUsers: formatToPercentage(pctActiveUsers),
      inactiveUsers: formatToPercentage(pctInactiveUsers),
      completedCheckins: formatToPercentage(pctCompletedCheckins),
      notCompletedCheckins: formatToPercentage(pctExpiredCheckins),
    }

    const updatedAtDate = new Date(updatedAt)
    const formattedDateTime = updatedAtDate.toLocaleString()

    res.render('pages/v2statistics/dashboard', {
      stats: { ...v2stats, avgHoursToComplete: hoursToHoursAndMinutes(v2stats.avgHoursToComplete) },
      percentages,
      formattedDateTime,
    })
  } catch (error) {
    next(error)
  }
}
