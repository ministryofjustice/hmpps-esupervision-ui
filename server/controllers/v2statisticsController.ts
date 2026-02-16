import { RequestHandler } from 'express'
import { services } from '../services'
import { V2FeedbackStats, V2StatsWithFeedback } from '../data/models/v2stats'

export const hoursToHoursAndMinutes = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  return `${h}h ${m}m`
}

const getFeedbackStats = (v2Stats: V2StatsWithFeedback): V2FeedbackStats => {
  const {
    feedbackTotal,
    howEasyCounts,
    howEasyPct,
    gettingSupportCounts,
    gettingSupportPct,
    improvementsCounts,
    improvementsPct,
  } = v2Stats

  return {
    feedbackTotal: feedbackTotal ?? 0,
    howEasyCounts,
    howEasyPct,
    gettingSupportCounts,
    gettingSupportPct,
    improvementsCounts,
    improvementsPct,
  }
}

export const renderV2stats: RequestHandler = async (req, res, next) => {
  try {
    const { esupervisionService } = services()
    const v2stats: V2StatsWithFeedback = await esupervisionService.getV2Stats()
    const feedbackStats = getFeedbackStats(v2stats)
    const { updatedAt } = v2stats
    const updatedAtDate = new Date(updatedAt)
    const formattedDate = updatedAtDate.toLocaleDateString('en-GB')
    const formattedTime = updatedAtDate.toLocaleTimeString()

    res.render('pages/v2statistics/dashboard', {
      feedbackStats,
      stats: { ...v2stats, avgHoursToComplete: hoursToHoursAndMinutes(v2stats.avgHoursToComplete) },
      date: formattedDate,
      time: formattedTime,
      hideFeedbackLink: true,
    })
  } catch (error) {
    next(error)
  }
}
