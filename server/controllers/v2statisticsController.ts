import { RequestHandler, Response, Request } from 'express'
import { z } from 'zod'
import { services } from '../services'
import { V2FeedbackStats, V2StatsResponse, V2StatsWithFeedback, YearMonth } from '../data/models/v2stats'
import { buildMonthOptions, toMonthValue } from '../utils/statsDateFiltering'
import { advanceMonths } from '../utils/utils'

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
  return esupervisionService.getV2StatsBetweenDateRange(monthFrom, advanceMonths(monthTo, 1))
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

const yearMonthSchema: z.ZodType<YearMonth> = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .transform(val => val as YearMonth)

const asOptionalQueryString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0].trim() : undefined
  }
  return typeof value === 'string' ? value.trim() : undefined
}

const monthRangeFromQuerySchema = (endDefault: YearMonth) => {
  return z
    .strictObject({
      monthFrom: z.preprocess(asOptionalQueryString, yearMonthSchema.optional()),
      monthTo: z.preprocess(asOptionalQueryString, yearMonthSchema.optional()),
    })
    .transform(data => ({
      monthFrom: (data.monthFrom ?? START_DEFAULT) as YearMonth,
      monthTo: (data.monthTo ?? endDefault) as YearMonth,
    }))
    .refine(data => data.monthFrom <= data.monthTo, {
      path: ['monthRange'],
      message: "The 'From' month must be before the 'To' month",
    })
}

const getMonthRangeFromQuery = (
  req: Request,
  res: Response,
  fromProviderDashboard?: boolean,
): { monthFrom: YearMonth; monthTo: YearMonth } | null => {
  const endDefault = toMonthValue(new Date()) // current month
  const parsed = monthRangeFromQuerySchema(endDefault).safeParse(req.query)

  if (parsed.success) {
    return parsed.data
  }

  const dashboardName = fromProviderDashboard ? 'providerDashboard' : 'dashboard'

  res.render(`pages/v2statistics/${dashboardName}`, {
    ...formatUpdatedAt(new Date()),
    hideFeedbackLink: true,
    fromMonthOptions: buildMonthOptions(START_DEFAULT),
    toMonthOptions: buildMonthOptions(endDefault),
    errors: {
      monthRange: parsed.error.issues[0]?.message ?? "The 'From' month must be before the 'To' month",
    },
  })

  return null
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
    const monthRange = getMonthRangeFromQuery(req, res)
    if (!monthRange) {
      return
    }

    const { monthFrom, monthTo } = monthRange

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
    const monthRange = getMonthRangeFromQuery(req, res, true)
    if (!monthRange) {
      return
    }

    const { monthFrom, monthTo } = monthRange

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
