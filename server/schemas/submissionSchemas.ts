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

export const videoReviewSchema = z.object({
  videoMeetsRules: z.string({
    required_error: 'Confirm if this video meets the rules',
  }),
})

const validCircumstances = ['homeAddress', 'employmentStatus', 'supportSystem', 'contactDetails', 'none'] as const

export const circumstancesSchema = z
  .object({
    circumstances: z.preprocess(
      val => {
        if (typeof val === 'string') return [val]
        if (Array.isArray(val)) return val
        return []
      },
      z.array(z.enum(validCircumstances)).min(1, 'Select if any of these circumstances have changed'),
    ),
    homeAddressChanges: z.string().optional(),
    employmentStatusChanges: z.string().optional(),
    supportSystemChanges: z.string().optional(),
    contactDetailsChanges: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { circumstances } = data

    const hasNone = circumstances.includes('none')
    const selectedOthers = circumstances.filter(c => c !== 'none')

    if (!hasNone) {
      for (const key of selectedOthers) {
        const fieldName = `${key}Changes` as keyof typeof data
        const value = data[fieldName].toString()

        if (!value || value.trim() === '') {
          ctx.addIssue({
            path: [fieldName],
            code: z.ZodIssueCode.custom,
            message: `Enter how your ${key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()} changed`,
          })
        }
      }
    }
  })

export const policeSchema = z
  .object({
    policeContact: z.enum(['yes', 'no'], {
      required_error: 'Select yes if you have had contact with the police',
    }),
    policeContactDetails: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.policeContact === 'yes') {
      if (!data.policeContactDetails || data.policeContactDetails.trim() === '') {
        ctx.addIssue({
          path: ['policeContactDetails'],
          code: z.ZodIssueCode.custom,
          message: 'Enter what kind of contact you have had with the police',
        })
      }
    }
  })

export const alcoholSchema = z.object({
  alcoholUse: z.enum(['increased', 'same', 'decreased', 'no'], {
    required_error: 'Select if your alcohol consumption has changed',
  }),
})

export const drugsSchema = z.object({
  drugsUse: z.enum(['increased', 'same', 'decreased', 'no'], {
    required_error: 'Select if your drug use changed since your last check-in',
  }),
})

export const physicalHealthSchema = z
  .object({
    physicalHealth: z.enum(['yes', 'no'], {
      required_error: 'Select yes if you have any physical health concerns',
    }),
    physicalHealthDetails: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.physicalHealth === 'yes') {
      if (!data.physicalHealthDetails || data.physicalHealthDetails.trim() === '') {
        ctx.addIssue({
          path: ['physicalHealthDetails'],
          code: z.ZodIssueCode.custom,
          message: 'Enter your health concern',
        })
      }
    }
  })

export const mentalHealthSchema = z.object({
  mentalHealth: z.enum(['veryWell', 'well', 'ok', 'notGreat', 'struggling'], {
    required_error: 'Select how you are feeling',
  }),
})

export const callbackSchema = z.object({
  callback: z.enum(['yes', 'no'], {
    required_error: 'Select yes if you need to speak to your probation practitioner',
  }),
})

export const checkAnswersSchema = z.object({
  checkAnswers: z.enum(['confirm'], {
    required_error: 'Confirm your details are correct',
  }),
})
