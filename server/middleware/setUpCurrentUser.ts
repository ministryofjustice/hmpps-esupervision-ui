import express from 'express'
import logger from '../../logger'
import LoggedInUser from '../data/models/loggedInUser'
import addUserMetadataToTelemetry from '../utils/telemetry'

export default function setUpCurrentUser() {
  const router = express.Router()

  router.use((req, res, next) => {
    try {
      res.locals.user = LoggedInUser.fromUserToken(res.locals.user.token)

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  })
  router.use(addUserMetadataToTelemetry())

  return router
}
