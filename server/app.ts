import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { appInsightsMiddleware } from './utils/azureAppInsights'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
// import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'
import populateValidationErrors from './middleware/populateValidationErrors'
import storeFormDataInSession from './middleware/storeFormDataInSession'
import routes from './routes'
import statisticsRoutes from './routes/statisticsRoutes'
import submissionRoutes from './routes/submissionRoutes'
import practitionersRoutes from './routes/practitionersRoutes'
import featureFlags from './middleware/featureFlags'

import type { Services } from './services'
import restrictToUK from './middleware/restrictToUK'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  // don't send X-Powered-By header
  app.disable('x-powered-by')

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  // app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())

  app.use(cookieParser(`esCookieSecret${process.env.COOKIE_SECRET}`))
  app.use(featureFlags())

  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(setUpCsrf())

  app.use(bodyParser.json())
  app.use(storeFormDataInSession())
  app.use(populateValidationErrors())

  app.use(restrictToUK)

  app.use(routes())

  app.use('/submission/:submissionId', submissionRoutes(services))
  app.use('/statistics', statisticsRoutes())
  app.use('/practitioners', practitionersRoutes())
  app.use('/practitioners', (req, res) => {
    res.status(404).render('pages/practitioners/not-found')
  })

  app.use((req, res) => {
    res.status(404).render('pages/not-found')
  })
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
