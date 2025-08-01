import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export type validationErrors = { text: string; href: string }[]

export default function validateFormData(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationResult = schema.safeParse(req.body)

    if (validationResult.success) {
      req.body = validationResult.data
      next()
    } else {
      const errorMessages = validationResult.error.issues.map(err => {
        return {
          text: err.message,
          href: `#${err.path.join('.')}`,
        }
      })

      req.flash('validationErrors', JSON.stringify(errorMessages))
      res.redirect(req.originalUrl)
    }
  }
}

export const findError = (errors: validationErrors, fieldName: string) => {
  if (!errors || !Array.isArray(errors)) {
    return null
  }
  return errors.find(error => error.href === `#${fieldName}`) || null
}

export const createSchema = <T = object>(shape: T) => zodAlwaysRefine(zObjectStrict(shape))

const zObjectStrict = <T = object>(shape: T) => z.object({ _csrf: z.string().optional(), ...shape }).strict()

const zodAlwaysRefine = <T extends z.ZodTypeAny>(zodType: T) =>
  z.any().transform((val, ctx) => {
    const res = zodType.safeParse(val)
    if (!res.success) res.error.issues.forEach(issue => ctx.addIssue(issue.message))
    return res.data || val
  }) as unknown as T
