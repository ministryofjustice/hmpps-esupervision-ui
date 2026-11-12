import jwt from 'jsonwebtoken'
import LoggedInUser from './loggedInUser'

const tokenWith = (claims: Record<string, unknown>) =>
  jwt.sign({ name: 'john smith', user_id: '123', user_name: 'USER1', authorities: ['ROLE_A'], ...claims }, 'secret')

describe('LoggedInUser.fromUserToken', () => {
  it('reads the HMPPS Auth user_uuid claim', () => {
    const user = LoggedInUser.fromUserToken(tokenWith({ user_uuid: '11111111-1111-1111-1111-111111111111' }))

    expect(user.userUuid).toEqual('11111111-1111-1111-1111-111111111111')
    expect(user.userId).toEqual('123')
  })

  it('leaves userUuid undefined when the token has no user_uuid claim', () => {
    const user = LoggedInUser.fromUserToken(tokenWith({}))

    expect(user.userUuid).toBeUndefined()
  })
})
