import { z } from 'zod'

export const personalDetailsSchema = z
  .object({
    firstName: z.string().min(1, 'Enter your first name'),
    lastName: z.string().min(1, 'Enter your last name'),
    day: z.coerce
      .number({
        message: 'Enter a valid day',
      })
      .positive({ message: 'Enter day' }),
    month: z.coerce
      .number({
        message: 'Enter a valid month',
      })
      .positive({ message: 'Enter month' }),
    year: z.coerce
      .number({
        message: 'Enter a valid year',
      })
      .positive({ message: 'Enter year' }),
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

export const mentalHealthSchema = z.object({
  mentalHealth: z.enum(['VERY_WELL', 'WELL', 'OK', 'NOT_GREAT', 'STRUGGLING'], {
    required_error: 'Select how you are feeling',
  }),
})

export const assistanceSchema = z.object({
  assistance: z.preprocess(
    val => {
      if (typeof val === 'string') return [val]
      if (Array.isArray(val)) return val
      return []
    },
    z.array(z.enum(validCircumstances)).min(1, 'Select if you need assistance'),
  ),
})

export const callbackSchema = z.object({
  callback: z.enum(['YES', 'NO'], {
    required_error: 'Select yes if you need to speak to your probation practitioner',
  }),
})

export const checkAnswersSchema = z.object({
  checkAnswers: z.enum(['CONFIRM'], {
    required_error: 'Confirm your details are correct',
  }),
})
