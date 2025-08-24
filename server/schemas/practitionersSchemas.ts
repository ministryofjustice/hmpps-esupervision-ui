import { z } from 'zod'
import { createDateSchema } from './shared'

const dobSchema = createDateSchema({
  who: 'their',
  label: 'date of birth',
  groupPath: 'dob',
  rules: {
    mustBeInPast: true,
  },
})

export const personsDetailsSchema = z
  .object({
    firstName: z.string().min(1, 'Enter their first name'),
    lastName: z.string().min(1, 'Enter their last name'),
  })
  .and(dobSchema)

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
  email: z.email({ message: 'Enter an email address in the correct format, like name@example.com' }),
})

export const mobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/, {
      message: 'Enter a phone number, like 07700 900 982',
    }),
})

const startDateSchema = createDateSchema({
  who: 'their',
  label: 'start date',
  groupPath: 'startDate',
  prefix: 'startDate',
  rules: {
    allowToday: true,
    mustBeInFuture: true,
  },
})

export const setUpSchema = startDateSchema.and(
  z.object({
    frequency: z
      .string({
        error: issue =>
          issue.input === undefined ? 'Select how often you would like the person to check in' : issue.message,
      })
      .describe('Select how often you would like the person to check in'),
  }),
)

export const OffenderInfoInput = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  day: z.nullish(z.coerce.number().min(1).max(31)),
  month: z.nullish(z.coerce.number().min(1).max(12)),
  year: z.nullish(z.coerce.number().min(1900).max(2100)),
  contactPreference: z.enum(['EMAIL', 'TEXT']),
  email: z.nullish(z.email()),
  mobile: z.nullish(z.string()),
  frequency: z.enum(['WEEKLY', 'TWO_WEEKS', 'FOUR_WEEKS']),
  startDateYear: z.coerce.number().min(2025).max(2100),
  startDateMonth: z.coerce.number().min(1).max(12),
  startDateDay: z.coerce.number().min(1).max(31),
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
