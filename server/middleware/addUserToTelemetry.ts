import type { RequestHandler } from 'express'
import LoggedInUser from '../data/models/loggedInUser'
import addUserMetadataToTelemetry from '../utils/telemetry'

/**
 * Reads the user's ids from their token rather than res.locals.user, which only some routers
 * replace with a LoggedInUser. Telemetry must never fail a request, so a bad token yields nothing.
 */
export function userTelemetryAttributes(user?: { token?: string }): { userId?: string; userUuid?: string } {
  if (!user?.token) return {}
  try {
    const { userId, userUuid } = LoggedInUser.fromUserToken(user.token)
    return { userId, userUuid }
  } catch {
    return {}
  }
}

/** Tags every signed in request's telemetry with the user's ids. Must run after setUpAuthentication. */
export default function addUserToTelemetry(): RequestHandler {
  return addUserMetadataToTelemetry((_req, res) => userTelemetryAttributes(res.locals.user))
}
