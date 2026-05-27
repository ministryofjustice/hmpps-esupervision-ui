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
