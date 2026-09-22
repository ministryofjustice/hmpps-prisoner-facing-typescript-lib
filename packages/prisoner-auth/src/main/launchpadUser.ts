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
  establishment: IdToken['establishment']
  idToken: IdToken
  refreshToken: string
  accessToken: string
} & HmppsUserCompatibility

export const userFromTokens = ({ idToken, accessToken, refreshToken }: RawTokens): LaunchpadUser => {
  const parsedIdToken = tokenFromJwt<IdToken>(idToken)
  const { name, sub, establishment } = parsedIdToken
  const authSource = 'prisoner-auth'

  return {
    establishment,
    idToken: parsedIdToken,
    refreshToken,
    accessToken,
    authSource,
    name,
    token: idToken,
    username: sub,
    userId: sub,
    displayName: name,
    userRoles: [],
  }
}
