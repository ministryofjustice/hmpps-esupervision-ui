import { jwtDecode } from 'jwt-decode'
import { convertToTitleCase } from '../../utils/utils'

export type ExternalUserId = string

export interface ExternalUser {
  externalId(): ExternalUserId
}

export default class LoggedInUser {
  userId: string

  userName: string

  name: string

  displayName: string

  userRoles: string[]

  token: string

  private constructor(userId: string, userName: string, name: string, userRoles: string[], token: string) {
    this.userId = userId
    this.userName = userName
    this.name = name
    this.displayName = convertToTitleCase(name)
    this.userRoles = userRoles
    this.token = token
  }

  public static fromUserToken(token: string): LoggedInUser {
    const {
      name,
      user_id: userId,
      user_name: userName,
      authorities: roles = [],
    } = jwtDecode(token) as {
      name?: string
      user_id?: string
      user_name?: string
      authorities?: string[]
    }

    return new LoggedInUser(userId, userName, name, roles, token)
  }

  externalId(): ExternalUserId {
    return this.userName
  }
}
