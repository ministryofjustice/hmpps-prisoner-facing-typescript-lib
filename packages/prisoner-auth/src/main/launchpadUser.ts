import { IdToken, RawTokens, tokenFromJwt } from './tokens'

type HmppsUserCompatibility = {
  authSource: 'prisoner-auth'
  name: string
  token: string
  username: string
  userId: string
  displayName: string
  userRoles: string[]
}

export type LaunchpadUser = {
  idToken: IdToken
  refreshToken: string
  accessToken: string
} & HmppsUserCompatibility

export const userFromTokens = ({ idToken, accessToken, refreshToken }: RawTokens): LaunchpadUser => {
  const parsedIdToken = tokenFromJwt<IdToken>(idToken)
  const { name, sub } = parsedIdToken
  const authSource = 'prisoner-auth'

  return {
    idToken: parsedIdToken,
    refreshToken,
    accessToken,
    authSource,
    name,
    token: idToken,
    username: name,
    userId: sub,
    displayName: name,
    userRoles: [],
  }
}
