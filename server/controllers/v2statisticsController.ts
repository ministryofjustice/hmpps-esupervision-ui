import { RequestHandler, Response, Request } from 'express'
import { services } from '../services'
import { V2FeedbackStats, V2StatsResponse, V2StatsWithFeedback, YearMonth } from '../data/models/v2stats'
import { buildMonthOptions, toMonthValue } from '../utils/statsDateFiltering'

const START_DEFAULT: YearMonth = '2025-08'

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

const getV2Stats = (monthFrom: YearMonth, monthTo: YearMonth) => {
  const { esupervisionService } = services()

  if (monthFrom === monthTo) {
    return esupervisionService.getV2StatsForOneMonth(monthFrom)
  }

  return esupervisionService.getV2StatsBetweenDateRange(monthFrom, monthTo)
}

const buildCommonViewModel = (monthFrom: YearMonth, monthTo: YearMonth, updatedAt: Date | string | number) => {
  const { date, time } = formatUpdatedAt(updatedAt)

  return {
    date,
    time,
    hideFeedbackLink: true,
    fromMonthOptions: buildMonthOptions(monthFrom),
    toMonthOptions: buildMonthOptions(monthTo),
    monthFrom,
    monthTo,
  }
}

const validateMonthInputs = (
  monthFrom: string,
  monthTo: string,
  res: Response,
  fromProviderDashboard?: boolean,
): boolean => {
  if (monthFrom > monthTo) {
    const updatedAtDate = new Date()
    const formattedDate = updatedAtDate.toLocaleDateString('en-GB')
    const formattedTime = updatedAtDate.toLocaleTimeString()

    const dashboardName = fromProviderDashboard ? 'providerDashboard' : 'dashboard'

    res.render(`pages/v2statistics/${dashboardName}`, {
      date: formattedDate,
      time: formattedTime,
      hideFeedbackLink: true,
      fromMonthOptions: buildMonthOptions(monthFrom),
      toMonthOptions: buildMonthOptions(monthTo),
      errors: {
        monthRange: "The 'From' month must be before the 'To' month",
      },
    })

    return false
  }

  return true
}

const getMonthRangeFromQuery = (req: Request): { monthFrom: YearMonth; monthTo: YearMonth } => {
  const endDefault = toMonthValue(new Date()) // current month

  const monthFrom =
    typeof req.query.monthFrom === 'string' && req.query.monthFrom ? (req.query.monthFrom as YearMonth) : START_DEFAULT

  const monthTo =
    typeof req.query.monthTo === 'string' && req.query.monthTo ? (req.query.monthTo as YearMonth) : endDefault

  return { monthFrom, monthTo }
}

const formatUpdatedAt = (updatedAt: string | number | Date) => {
  const d = new Date(updatedAt)
  return {
    date: d.toLocaleDateString('en-GB'),
    time: d.toLocaleTimeString(),
  }
}

export const renderV2stats: RequestHandler = async (req, res, next) => {
  try {
    const { monthFrom, monthTo } = getMonthRangeFromQuery(req)

    if (!validateMonthInputs(monthFrom, monthTo, res)) {
      return
    }

    const response: V2StatsResponse = await getV2Stats(monthFrom, monthTo)
    const { total } = response

    res.render('pages/v2statistics/dashboard', {
      ...buildCommonViewModel(monthFrom, monthTo, total.updatedAt),
      feedbackStats: getFeedbackStats(total),
      stats: total,
    })
  } catch (error) {
    next(error)
  }
}

export const renderV2statsByProvider: RequestHandler = async (req, res, next) => {
  try {
    const { monthFrom, monthTo } = getMonthRangeFromQuery(req)

    if (!validateMonthInputs(monthFrom, monthTo, res, true)) {
      return
    }

    const response: V2StatsResponse = await getV2Stats(monthFrom, monthTo)
    const { total, providers } = response

    res.render('pages/v2statistics/providerDashboard', {
      ...buildCommonViewModel(monthFrom, monthTo, total.updatedAt),
      totalStats: total,
      providerStats: providers,
    })
  } catch (error) {
    next(error)
  }
}
