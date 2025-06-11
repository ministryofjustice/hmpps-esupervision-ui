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

export const photoReviewSchema = z.object({
  photoMeetsRules: z.string({
    required_error: 'Confirm if this photo meets the rules',
  }),
})
