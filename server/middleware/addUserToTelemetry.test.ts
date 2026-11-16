import jwt from 'jsonwebtoken'
import { userTelemetryAttributes } from './addUserToTelemetry'

describe('userTelemetryAttributes', () => {
  it("reads the user's ids from their token", () => {
    const token = jwt.sign({ user_id: '123', user_uuid: '11111111-1111-1111-1111-111111111111' }, 'secret')

    // Only token is set, as on routes where res.locals.user comes straight from passport
    expect(userTelemetryAttributes({ token })).toEqual({
      userId: '123',
      userUuid: '11111111-1111-1111-1111-111111111111',
    })
  })

  it('returns nothing when no user is signed in', () => {
    expect(userTelemetryAttributes(undefined)).toEqual({})
  })

  it('returns nothing rather than throwing when the token cannot be decoded', () => {
    expect(userTelemetryAttributes({ token: 'not-a-jwt' })).toEqual({})
  })
})
