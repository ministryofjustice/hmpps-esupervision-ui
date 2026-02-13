import { RequestHandler } from 'express'
import { services } from '../services'
import { V2FeedbackStats, V2StatsWithFeedback } from '../data/models/v2stats'
import { GETTING_SUPPORT_OPTIONS, HOW_EASY_OPTIONS, IMPROVEMENT_OPTIONS } from '../data/v2statistics/feedbackConstants'

export const hoursToHoursAndMinutes = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  return `${h}h ${m}m`
}

function normaliseCounts<T extends string>(
  options: T[],
  values: Partial<Record<T, number>> | undefined,
): Record<T, number> {
  return Object.fromEntries(options.map(key => [key, values?.[key] ?? 0])) as Record<T, number>
}

export const getFeedbackStats = (v2Stats: V2StatsWithFeedback): V2FeedbackStats => {
  const howEasyCounts = normaliseCounts(HOW_EASY_OPTIONS, v2Stats.howEasyCounts)
  const howEasyPct = normaliseCounts(HOW_EASY_OPTIONS, v2Stats.howEasyPct)

  const gettingSupportCounts = normaliseCounts(GETTING_SUPPORT_OPTIONS, v2Stats.gettingSupportCounts)
  const gettingSupportPct = normaliseCounts(GETTING_SUPPORT_OPTIONS, v2Stats.gettingSupportPct)

  const improvementsCounts = normaliseCounts(IMPROVEMENT_OPTIONS, v2Stats.improvementsCounts)
  const improvementsPct = normaliseCounts(IMPROVEMENT_OPTIONS, v2Stats.improvementsPct)

  return {
    feedbackTotal: v2Stats.feedbackTotal ?? 0,
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
