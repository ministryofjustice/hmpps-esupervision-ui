import { faker } from '@faker-js/faker'

export const generateValidCrn = (): string => {
  const capitalLetter = faker.string.alpha({ length: 1, casing: 'upper' })
  const numbers = faker.string.numeric(6)

  return `${capitalLetter}${numbers}`
}

export const generateValidUKMobileNumber = (): string => {
  const remainingDigits = faker.string.numeric(9)

  return `07${remainingDigits}`
}
