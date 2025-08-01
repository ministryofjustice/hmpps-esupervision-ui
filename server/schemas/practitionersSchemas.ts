import { z } from 'zod'
import { isFuture, isToday } from 'date-fns'

export const personsDetailsSchema = z
  .object({
    firstName: z.string().min(1, 'Enter their first name'),
    lastName: z.string().min(1, 'Enter their last name'),
    day: z.coerce.number({ message: 'Enter a valid day' }).positive({ message: 'Enter day' }),
    month: z.coerce.number({ message: 'Enter a valid month' }).positive({ message: 'Enter month' }),
    year: z.coerce.number({ message: 'Enter a valid year' }).positive({ message: 'Enter year' }),
  })
  .refine(
    ({ day, month, year }) => {
      const d = new Date(year, month - 1, day)
      return d.getDate() === Number(day) && d.getMonth() === Number(month) - 1 && d.getFullYear() === Number(year)
    },
    {
      message: 'Enter a valid date of birth',
      path: ['dob'],
    },
  )

export const videoReviewSchema = z
  .object({
    reviewed: z
      .enum(['YES', 'NO'], {
        error: issue => (issue.input === undefined ? 'Select yes if the person is in the video' : issue.message),
      })
      .describe('Select yes if the person is in the video'),
  })
  .required()

export const contactPreferenceSchema = z
  .object({
    contactPreference: z
      .string({
        error: issue => (issue.input === undefined ? 'Select how you would like us to send a link' : issue.message),
      })
      .describe('Choose how you would like us to send a link'),
  })
  .required()

export const emailSchema = z.object({
  email: z
    .email({
      error: issue =>
        issue.input === undefined
          ? 'Enter an email address in the correct format, like name@example.com'
          : issue.message,
    })
    .describe('Enter an email address in the correct format, like name@example.com'),
})

export const mobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/, {
      message: 'Enter a phone number, like 07700 900 982',
    }),
})

export const setUpSchema = z
  .object({
    startDateDay: z.coerce.number({ message: 'Enter a valid day' }).positive({ message: 'Enter day' }),
    startDateMonth: z.coerce.number({ message: 'Enter a valid month' }).positive({ message: 'Enter month' }),
    startDateYear: z.coerce.number({ message: 'Enter a valid year' }).positive({ message: 'Enter year' }),
    frequency: z
      .string({
        error: issue =>
          issue.input === undefined
            ? 'Select how often you would like the person to submit online checks'
            : issue.message,
      })
      .describe('Select how often you would like the person to submit online checks'),
  })
  .refine(
    ({ startDateDay, startDateMonth, startDateYear }) => {
      const d = new Date(startDateYear, startDateMonth - 1, startDateDay)
      return (
        d.getDate() === Number(startDateDay) &&
        d.getMonth() === Number(startDateMonth) - 1 &&
        d.getFullYear() === Number(startDateYear)
      )
    },
    {
      message: 'Enter a valid date',
      path: ['startDate'],
    },
  )
  .refine(
    ({ startDateDay, startDateMonth, startDateYear }) => {
      const d = new Date(startDateYear, startDateMonth - 1, startDateDay)
      return isFuture(d) || isToday(d)
    },
    {
      message: 'Date must be in the future or today',
      path: ['startDate'],
    },
  )

export const practitionerSchema = z.object({
  firstName: z.string().min(1, 'Enter their first name'),
  lastName: z.string().min(1, 'Enter their last name'),
  mobile: z
    .string()
    .trim()
    .regex(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/, {
      message: 'Enter a phone number, like 07700 900 982',
    }),
  email: z.string().email({ message: 'Enter an email address in the correct format, like name@example.com' }),
  uuid: z.string().min(1, 'Enter their UUID'),
})

export const photoUploadSchema = z.object({
  photoUpload: z.string().min(1, 'Select a photo to upload'),
})
