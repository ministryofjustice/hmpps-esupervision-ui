import { z } from 'zod'
import { isExists, isFuture } from 'date-fns'

export function dateValidationMessage(
  label: string,
  missing: Array<'day' | 'month' | 'year' | '4 numbers for the year'>,
) {
  const readable = missing.map(m => (m === 'day' || m === 'month' || m === 'year' ? m : m))

  // Build a list of missing parts
  const withArticles = readable.map(p => (p === '4 numbers for the year' ? p : `a ${p}`))
  if (withArticles.length === 1) return `${label} must include ${withArticles[0]}`
  if (withArticles.length === 2) return `${label} must include ${withArticles[0]} and ${withArticles[1]}`
  return `${label} must include ${withArticles.slice(0, -1).join(', ')} and ${withArticles.slice(-1)}`
}

export const dobSchema = z
  .object({
    day: z.string().trim(),
    month: z.string().trim(),
    year: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    const label = 'Date of birth'

    const dayRaw = data.day
    const monthRaw = data.month
    const yearRaw = data.year

    const allEmpty = !dayRaw && !monthRaw && !yearRaw
    if (allEmpty) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter their date of birth',
        path: ['dob'],
      })
      return
    }

    const isDigits = (s: string) => /^\d+$/.test(s)
    const nonNumeric: Array<'day' | 'month' | 'year'> = []
    if (dayRaw && !isDigits(dayRaw)) nonNumeric.push('day')
    if (monthRaw && !isDigits(monthRaw)) nonNumeric.push('month')
    if (yearRaw && !isDigits(yearRaw)) nonNumeric.push('year')

    if (nonNumeric.length) {
      if (nonNumeric.length === 1) {
        const which = nonNumeric[0]
        let msg = 'Year must only contain numbers'
        if (which === 'day') msg = 'Day must only contain numbers'
        else if (which === 'month') msg = 'Month must only contain numbers'
        ctx.addIssue({
          code: 'custom',
          message: msg,
          path: [which],
        })
      } else {
        ctx.addIssue({
          code: 'custom',
          message: `${label} must only contain numbers`,
          path: ['dob'],
        })
      }
      return
    }

    const missingParts: Array<'day' | 'month' | 'year' | '4 numbers for the year'> = []
    if (!dayRaw) missingParts.push('day')
    if (!monthRaw) missingParts.push('month')
    if (!yearRaw) {
      missingParts.push('year')
    } else if (yearRaw.length !== 4) {
      missingParts.push('4 numbers for the year')
    }

    if (missingParts.length) {
      ctx.addIssue({
        code: 'custom',
        message: dateValidationMessage(label, missingParts),
        path: ['dob'],
      })
      return
    }

    const day = parseInt(dayRaw, 10)
    const month = parseInt(monthRaw, 10)
    const year = parseInt(yearRaw, 10)

    const monthIndex = month - 1
    if (!isExists(year, monthIndex, day)) {
      ctx.addIssue({
        code: 'custom',
        message: `${label} must be a real date`,
        path: ['dob'],
      })
      return
    }

    // Past-date check
    const candidate = new Date(year, monthIndex, day)
    if (isFuture(candidate)) {
      ctx.addIssue({
        code: 'custom',
        message: `${label} must be in the past`,
        path: ['dob'],
      })
    }
  })
