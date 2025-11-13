import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'
const config = hmppsConfig()

export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
  },
]

