import { RequestHandler } from 'express'
import { services } from '../services'
import { V2FeedbackStats, V2StatsResponse, V2StatsWithFeedback } from '../data/models/v2stats'

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

export const renderV2stats: RequestHandler = async (_req, res, next) => {
  try {
    const { esupervisionService } = services()
    const response: V2StatsResponse = await esupervisionService.getV2Stats()
    const { total } = response
    const feedbackStats = getFeedbackStats(total)
    const updatedAtDate = new Date(total.updatedAt)
    const formattedDate = updatedAtDate.toLocaleDateString('en-GB')
    const formattedTime = updatedAtDate.toLocaleTimeString()

    res.render('pages/v2statistics/dashboard', {
      feedbackStats,
      stats: total,
      date: formattedDate,
      time: formattedTime,
      hideFeedbackLink: true,
    })
  } catch (error) {
    next(error)
  }
}

export const renderV2statsByProvider: RequestHandler = async (_req, res, next) => {
  try {
    const { esupervisionService } = services()
    const response: V2StatsResponse = await esupervisionService.getV2Stats()
    const { total, providers } = response
    const updatedAtDate = new Date(total.updatedAt)
    const formattedDate = updatedAtDate.toLocaleDateString('en-GB')
    const formattedTime = updatedAtDate.toLocaleTimeString()

    res.render('pages/v2statistics/providerDashboard', {
      totalStats: total,
      providerStats: providers,
      date: formattedDate,
      time: formattedTime,
      hideFeedbackLink: true,
    })
  } catch (error) {
    next(error)
  }
}
