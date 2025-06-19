import { z } from 'zod'

export const personalDetailsSchema = z
  .object({
    firstName: z.string().min(1, 'Enter your first name'),
    lastName: z.string().min(1, 'Enter your last name'),
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

export const photoReviewSchema = z.object({
  photoMeetsRules: z.string({
    required_error: 'Select yes if this photo meets the rules',
  }),
})

export const contactPreferenceSchema = z.object({
  contactPreference: z.string({
    required_error: 'Choose how you would like us to send a link',
  }),
})

export const emailSchema = z.object({
  email: z.string().email({ message: 'Enter an email address in the correct format, like name@example.com' }),
})

export const mobileSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/, {
      message: 'Enter a phone number, like 07700 900 982',
    }),
})

export const checkAnswersSchema = z.object({
  checkAnswers: z.enum(['confirm'], {
    required_error: 'Confirm your details are correct',
  }),
})
