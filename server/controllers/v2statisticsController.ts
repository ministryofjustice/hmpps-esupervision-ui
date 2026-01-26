import { RequestHandler } from 'express'
import { services } from '../services'
import V2Stats from '../data/models/v2stats'

export function hoursToHoursAndMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  return `${h}h ${m}m`
}

const percentage = (part: number, total: number): string =>
  total > 0 ? `${Number(((part / total) * 100).toFixed(2))}%` : '0%'

export const getUserPercentages = (stats: V2Stats) => {
  const { totalSignedUp, activeUsers, inactiveUsers, completedCheckins, notCompletedOnTime } = stats

  const totalCheckins = completedCheckins + notCompletedOnTime

  return {
    activeUsers: percentage(activeUsers, totalSignedUp),
    inactiveUsers: percentage(inactiveUsers, totalSignedUp),
    completedCheckins: percentage(completedCheckins, totalCheckins),
    notCompletedCheckins: percentage(notCompletedOnTime, totalCheckins),
  }
}

export const renderV2stats: RequestHandler = async (req, res, next) => {
  try {
    const { esupervisionService } = services()
    const v2stats = await esupervisionService.getV2Stats()
    const percentages = getUserPercentages(v2stats)

    res.render('pages/v2statistics/dashboard', {
      stats: { ...v2stats, avgHoursToComplete: hoursToHoursAndMinutes(v2stats.avgHoursToComplete) },
      percentages,
    })
  } catch (error) {
    next(error)
  }
}
