import { z } from 'zod'
import { isBefore, isValid, parse, startOfToday } from 'date-fns'
import { createDateSchema } from './shared'

const dobSchema = createDateSchema({
  who: 'their',
  label: 'date of birth',
  groupPath: 'dob',
  rules: {
    mustBeInPast: true,
  },
})

const crnRegeex = /^[A-Za-z]\d{6}$/

export const personsDetailsSchema = z
  .object({
    firstName: z.string().min(1, 'Enter their first name'),
    lastName: z.string().min(1, 'Enter their last name'),
  })
  .and(dobSchema)
  .and(
    z.object({
      crn: z.string().regex(crnRegeex, {
        message: 'Enter their case reference number, like A123456',
      }),
    }),
  )

export const expiredCheckinReviewSchema = z
  .object({
    checkinStatus: z.literal(['EXPIRED']),
    missedCheckinComment: z
      .string()
      .nonempty({ message: 'Enter the reason they did not complete their checkin' })
      .describe('Enter the reason they did not complete their checkin'),
  })
  .required()

export const submittedCheckinReviewSchema = z
  .object({
    checkinStatus: z.literal(['SUBMITTED']),
    idVerification: z
      .enum(['YES', 'NO'], {
        error: issue =>
          issue.input === undefined ? 'Select yes if the person in the video is the correct person' : issue.message,
      })
      .describe('Select yes if the person in the video is the correct person'),
  })
  .required()

export const videoReviewSchema = z.discriminatedUnion('checkinStatus', [
  expiredCheckinReviewSchema,
  submittedCheckinReviewSchema,
])

export const contactPreferenceSchema = z
  .object({
    checkYourAnswers: z.string(),
    contactPreference: z
      .string({
        error: issue =>
          issue.input === undefined ? 'Select how the person would like us to send a link' : issue.message,
      })
      .describe('Select how the person would like us to send a link'),
  })
  .required()

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter the person’s email address',
        })
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter an email address in the correct format, like name@example.com',
        })
      }
    }),
})

export const mobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!/^[0-9+\s()]*$/.test(val)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Phone number must only contain numbers',
        })
        return
      }
      if (!/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/.test(val)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a phone number, like 07700 900 982',
        })
      }
    }),
})

export const futureDateField = (label = 'Date', emptyCustomMessage?: string) =>
  z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({ code: 'custom', message: emptyCustomMessage || `Enter ${label.toLowerCase()}` })
        return
      }
      const parsed = parse(val, 'd/M/yyyy', new Date())
      if (!isValid(parsed)) {
        ctx.addIssue({ code: 'custom', message: `${label} must be a real date` })
        return
      }
      const candidate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
      if (isBefore(candidate, startOfToday())) {
        ctx.addIssue({ code: 'custom', message: `${label} must be today or in the future` })
      }
    })

export const setUpSchema = z.object({
  startDate: futureDateField('Start date', 'Enter the date you would like the person to complete their first check in'),
  frequency: z
    .string({
      error: issue =>
        issue.input === undefined ? 'Select how often you would like the person to check in' : issue.message,
    })
    .describe('Select how often you would like the person to check in'),
})

export const updateSetUpSchema = z.object({
  startDate: futureDateField('Start date', 'Enter the date you would like the person to complete their next check in'),
  frequency: z
    .string({
      error: issue =>
        issue.input === undefined ? 'Select how often you would like the person to check in' : issue.message,
    })
    .describe('Select how often you would like the person to check in'),
})

export const OffenderInfoInput = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  day: z.nullish(z.coerce.number().min(1).max(31)),
  month: z.nullish(z.coerce.number().min(1).max(12)),
  year: z.nullish(z.coerce.number().min(1900).max(2100)),
  crn: z.string().regex(crnRegeex),
  contactPreference: z.enum(['EMAIL', 'TEXT']),
  email: z.nullish(z.email()),
  mobile: z.nullish(z.string()),
  frequency: z.enum(['WEEKLY', 'TWO_WEEKS', 'FOUR_WEEKS', 'EIGHT_WEEKS']),
  startDate: z.string(),
  startedAt: z.iso.datetime(),
})

export const photoUploadSchema = z.object({
  checkYourAnswers: z.string(),
  photoUpload: z.string().min(1, 'Select a photo of the person'),
})

export const stopCheckinsSchema = z
  .object({
    stopCheckins: z
      .enum(['YES', 'NO'], {
        error: issue => {
          return {
            message:
              issue.input === undefined ? 'Select yes if you want to stop check ins for the person' : issue.message,
          }
        },
      })
      .describe('Select yes if you want to stop check ins for the person'),
    stopCheckinDetails: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.stopCheckins === 'YES') {
      if (!data.stopCheckinDetails || data.stopCheckinDetails.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['stopCheckinDetails'],
          message: 'Enter the reason for stopping',
        })
      }
    }
  })
