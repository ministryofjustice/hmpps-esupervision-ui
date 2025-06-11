import { z } from 'zod'

export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export const videoReviewSchema = z.object({
  videoMeetsRules: z.string({
    required_error: 'Confirm if this video meets the rules',
  }),
})

export const circumstancesSchema = z
  .object({
    circumstances: z.string().optional(),
    homeAddressChanges: z.string().optional(),
  })
  .refine(
    data => {
      if (data.circumstances) {
        return typeof data.homeAddressChanges === 'string' && data.homeAddressChanges.trim() !== ''
      }
      return true
    },
    {
      message: 'Tell us how your home address has changed',
      path: ['homeAddressChanges'],
    },
  )
