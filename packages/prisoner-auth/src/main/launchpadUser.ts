import { IdToken, RawTokens, tokenFromJwt } from './tokens'

export type LaunchpadUser = {
  authSource: 'prisoner-auth'
  idToken: string
  refreshToken: string
  accessToken: string
  establishment: IdToken['establishment']
  name: string
  givenName: string
  familyName: string

  // The following fields are for compatibility with HmppsUser only
  token: string
  username: string
  userId: string
  displayName: string
  userRoles: string[]
}

export const userFromTokens = ({ idToken, accessToken, refreshToken }: RawTokens): LaunchpadUser => {
  const { establishment, name, given_name: givenName, family_name: familyName, sub } = tokenFromJwt<IdToken>(idToken)
  const authSource = 'prisoner-auth'

  return {
    authSource,
    idToken,
    refreshToken,
    accessToken,
    establishment,
    name,
    givenName,
    familyName,

    // The following fields are for compatibility with HmppsUser only
    token: idToken,
    username: name,
    userId: sub,
    displayName: name,
    userRoles: [],
  }
}
