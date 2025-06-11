import { z } from 'zod'

export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export const photoReviewSchema = z.object({
  photoMeetsRules: z.string({
    required_error: 'Confirm if this photo meets the rules',
  }),
})
