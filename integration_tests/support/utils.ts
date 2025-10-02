import { faker } from '@faker-js/faker'

const generateValidCrn = (): string => {
  const capitalLetter = faker.string.alpha({ length: 1, casing: 'upper' })
  const numbers = faker.string.numeric(6)

  return `${capitalLetter}${numbers}`
}

export default generateValidCrn
