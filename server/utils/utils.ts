import { addDays, format, isValid, parseISO, startOfDay, differenceInDays, isAfter } from 'date-fns'
import CheckinInterval from '../data/models/checkinInterval'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

export const formatDate = (date?: string | Date, fmt = 'd MMMM yyyy') => {
  if (!date) return undefined
  const richDate = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(richDate)) return undefined
  return format(richDate, fmt)
}

const isLowerCase = (val: string): boolean => /^[a-z]*$/.test(val)

const lowercaseExceptAcronym = (val: string): string => {
  if (val.includes('-')) {
    return val
      .split('-')
      .map(part => (Array.from(part).some(isLowerCase) ? part.toLowerCase() : part))
      .join('-')
  }

  if (val.length < 2 || Array.from(val).some(isLowerCase)) {
    return val.toLowerCase()
  }
  return val
}

export const sentenceCase = (val: string, startsWithUppercase: boolean = true): string => {
  const words = val.split(/\s+/)
  const sentence = words.map(lowercaseExceptAcronym).join(' ')
  return startsWithUppercase ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence
}

const CheckinIntervalValues = new Map([
  [CheckinInterval.Weekly, 7],
  [CheckinInterval.TwoWeeks, 14],
  [CheckinInterval.FourWeeks, 28],
  [CheckinInterval.EightWeeks, 56],
])

export const calculateNextCheckinDate = (
  now: Date,
  firstCheckin: Date,
  checkinInterval: CheckinInterval,
): Date | undefined => {
  const today = startOfDay(now)

  if (!isAfter(today, firstCheckin)) {
    return firstCheckin
  }

  const daysSinceFirstCheckin = differenceInDays(today, firstCheckin)
  const intervalValue = CheckinIntervalValues.get(checkinInterval)
  let result: Date | undefined
  if (intervalValue) {
    const intervalsPassed = Math.floor(daysSinceFirstCheckin / intervalValue)
    result = addDays(firstCheckin, (intervalsPassed + 1) * intervalValue)
  }

  return result
}
