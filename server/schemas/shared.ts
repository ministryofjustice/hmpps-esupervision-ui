import { z } from 'zod'
import { isExists, isFuture, isPast, isToday } from 'date-fns'
import { sentenceCase } from '../utils/utils'

type Who = 'your' | 'their'

type DateSchemaOptions<P extends string> = {
  prefix?: P
  who?: Who
  label?: string
  groupPath?: string
  rules?: {
    mustBeInPast?: boolean
    mustBeInFuture?: boolean
    allowToday?: boolean
  }
}

export function dateValidationMessage(label: string, missing: Array<string>) {
  const readable = missing.map(m => (m === 'day' || m === 'month' || m === 'year' ? m : m))

  // Build a list of missing parts
  const withArticles = readable.map(p => (p === '4 numbers for the year' ? p : `a ${p}`))
  if (withArticles.length === 1 && withArticles[0] === '4 numbers for the year') return 'Year must include 4 numbers'
  if (withArticles.length === 1) return `${label} must include ${withArticles[0]}`
  if (withArticles.length === 2) return `${label} must include ${withArticles[0]} and ${withArticles[1]}`
  return `${label} must include ${withArticles.slice(0, -1).join(', ')} and ${withArticles.slice(-1)}`
}

export function createDateSchema({
  prefix,
  who = 'your',
  label = 'date',
  groupPath = prefix,
  rules,
}: DateSchemaOptions<string>) {
  const dayKey = prefix ? `${prefix}Day` : 'day'
  const monthKey = prefix ? `${prefix}Month` : 'month'
  const yearKey = prefix ? `${prefix}Year` : 'year'
  const sentenceCaseLabel = sentenceCase(label)
  return z
    .object({
      [dayKey]: z.string().trim(),
      [monthKey]: z.string().trim(),
      [yearKey]: z.string().trim(),
    })
    .superRefine((data, ctx) => {
      const dataCopy: Record<string, string> = { ...data }

      const dayRaw = dataCopy[dayKey]
      const monthRaw = dataCopy[monthKey]
      const yearRaw = dataCopy[yearKey]

      const allEmpty = !dayRaw && !monthRaw && !yearRaw
      if (allEmpty) {
        ctx.addIssue({
          code: 'custom',
          message: `Enter ${who} ${label.toLowerCase()}`,
          path: [groupPath],
        })
        return
      }

      const isDigits = (s: string) => /^\d+$/.test(s)
      const nonNumeric: Array<string> = []
      if (dayRaw && !isDigits(dayRaw)) nonNumeric.push(dayKey)
      if (monthRaw && !isDigits(monthRaw)) nonNumeric.push(monthKey)
      if (yearRaw && !isDigits(yearRaw)) nonNumeric.push(yearKey)

      if (nonNumeric.length) {
        if (nonNumeric.length === 1) {
          const which = nonNumeric[0]
          let msg = 'Year must only contain numbers'
          if (which === dayKey) msg = 'Day must only contain numbers'
          else if (which === monthKey) msg = 'Month must only contain numbers'
          ctx.addIssue({
            code: 'custom',
            message: msg,
            path: [which],
          })
        } else {
          ctx.addIssue({
            code: 'custom',
            message: `${sentenceCaseLabel} must only contain numbers`,
            path: ['dob'],
          })
        }
        return
      }

      const missingParts: Array<string> = []
      if (!dayRaw) missingParts.push('day')
      if (!monthRaw) missingParts.push('month')
      if (!yearRaw) {
        missingParts.push('year')
      } else if (yearRaw.length !== 4) {
        missingParts.push('4 numbers for the year')
      }

      function getPathForMissingParts(mp: string[]): string[] {
        if (mp.length === 1) {
          switch (mp[0]) {
            case 'day':
              return [dayKey]
            case 'month':
              return [monthKey]
            default:
              return [yearKey]
          }
        }
        return [groupPath]
      }

      if (missingParts.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: dateValidationMessage(sentenceCaseLabel, missingParts),
          path: getPathForMissingParts(missingParts),
        })
        return
      }

      const day = parseInt(dayRaw, 10)
      const month = parseInt(monthRaw, 10)
      const year = parseInt(yearRaw, 10)

      const dayInvalid = day < 1 || day > 31
      const monthInvalid = month < 1 || month > 12
      const yearInvalid = year < 1900 || year > 2100

      const monthIndex = month - 1
      let path: string[] | null = null

      if (dayInvalid && !monthInvalid) {
        // Highlight day error if day is invalid but month is OK
        path = [dayKey]
      } else if (!dayInvalid && monthInvalid) {
        // Highlight month error if month is invalid but day is OK
        path = [monthKey]
      } else if (dayInvalid && monthInvalid) {
        // Both day and month are invalid, highlight date group
        path = [groupPath]
      } else if (yearInvalid || !isExists(year, monthIndex, day)) {
        path = [groupPath]
      }

      if (path) {
        ctx.addIssue({
          code: 'custom',
          message: `${sentenceCaseLabel} must be a real date`,
          path,
        })
        return
      }

      const candidate = new Date(year, monthIndex, day)

      if (rules?.mustBeInFuture && rules?.allowToday) {
        // Future-date check, allowing today
        if (isFuture(candidate) || isToday(candidate)) {
          return // Valid future date or today
        }
        ctx.addIssue({
          code: 'custom',
          message: `${sentenceCaseLabel} must be today or in the future`,
          path: [groupPath],
        })
      }

      if (rules?.mustBeInFuture) {
        // Future-date check, not allowing today
        if (!isFuture(candidate)) {
          ctx.addIssue({
            code: 'custom',
            message: `${sentenceCaseLabel} must be in the future`,
            path: [groupPath],
          })
        }
      }

      if (rules?.mustBeInPast) {
        // Past-date check
        if (!isPast(candidate)) {
          ctx.addIssue({
            code: 'custom',
            message: `${sentenceCaseLabel} must be in the past`,
            path: [groupPath],
          })
        }
      }
    })
}
