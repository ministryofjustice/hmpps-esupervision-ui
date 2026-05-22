import { z } from 'zod'
import { emailSchema, mobileSchema } from './practitionersSchemas'

const crnRegex = /^[A-Za-z]\d{6}$/

export const inviteCrnSchema = z.object({
  crn: z.string().regex(crnRegex, {
    message: 'Enter their case reference number, like A123456',
  }),
})

export const inviteContactPreferenceSchema = z.object({
  checkYourAnswers: z.string().optional(),
  contactPreference: z.enum(['EMAIL', 'TEXT'], {
    error: issue => (issue.input === undefined ? 'Select a contact method' : issue.message),
  }),
})

export { emailSchema as inviteEmailSchema, mobileSchema as inviteMobileSchema }

export const inviteSubmissionSchema = z
  .object({
    crn: z.string().regex(crnRegex),
    contactPreference: z.enum(['EMAIL', 'TEXT']),
    email: z.string().optional(),
    mobile: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contactPreference === 'EMAIL' && !data.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Enter an email address in the correct format' })
    }
    if (data.contactPreference === 'TEXT' && !data.mobile) {
      ctx.addIssue({ code: 'custom', path: ['mobile'], message: 'Enter a mobile number in the correct format' })
    }
  })

export type InvitePopSubmission = z.infer<typeof inviteSubmissionSchema>
