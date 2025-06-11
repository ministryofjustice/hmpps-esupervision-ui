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
      console.log('Circumstances data:', data.circumstances)
      if (data.circumstances) {
        return typeof data.homeAddressChanges === 'string' && data.homeAddressChanges.trim() !== ''
      }
      return true
    },
    {
      message: 'Home address is required when circumstances is checked.',
      path: ['homeAddressChanges'],
    },
  )
