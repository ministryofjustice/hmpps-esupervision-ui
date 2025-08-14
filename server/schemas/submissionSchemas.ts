import { z } from 'zod'
import { createDateSchema } from './shared'

const dobSchema = createDateSchema({
  who: 'your',
  label: 'date of birth',
  groupPath: 'dob',
  rules: {
    mustBeInPast: true,
  },
})

export const personalDetailsSchema = z
  .object({
    firstName: z.string().min(1, 'Enter your first name'),
    lastName: z.string().min(1, 'Enter your last name'),
  })
  .and(dobSchema)

const validCircumstances = [
  'MENTAL_HEALTH',
  'ALCOHOL',
  'DRUGS',
  'MONEY',
  'HOUSING',
  'SUPPORT_SYSTEM',
  'OTHER',
  'NO_HELP',
] as const

const MentalHealthEnum = z
  .enum(['VERY_WELL', 'WELL', 'OK', 'NOT_GREAT', 'STRUGGLING'], {
    error: issue => (issue.input === undefined ? 'Select how you are feeling' : issue.message),
  })
  .describe('Select how you are feeling')

export const mentalHealthSchema = z.object({
  mentalHealth: MentalHealthEnum,
})

export const assistanceSchema = z.object({
  assistance: z.preprocess(
    val => {
      if (typeof val === 'string') return [val]
      if (Array.isArray(val)) return val
      return []
    },
    z.array(z.enum(validCircumstances)).min(1, "Select what you need help with or select 'No, I do not need help'"),
  ),
})

export const callbackSchema = z
  .object({
    callback: z
      .enum(['YES', 'NO'], {
        error: issue => {
          return issue.input === undefined ? 'Select yes if you need to speak to your probation officer' : issue.message
        },
      })
      .describe('Select yes if you need to speak to your probation officer'),
  })
  .required()

export const checkAnswersSchema = z
  .object({
    checkAnswers: z
      .enum(['CONFIRM'], {
        error: issue => (issue.input === undefined ? 'Confirm your details are correct' : issue.message),
      })
      .describe('Confirm your details are correct'),
  })
  .required()
