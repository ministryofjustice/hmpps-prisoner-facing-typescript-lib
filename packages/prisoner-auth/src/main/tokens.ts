import superagent from 'superagent'

export type IdToken = {
  name: string
  given_name: string
  family_name: string
  nonce?: string
  iat: number
  aud: string
  sub: string
  exp: number // exp is in seconds
  booking: { id: string }
  establishment: {
    agency_id: string
    name: string
    display_name: string
    youth: boolean
  }
  iss: string
}

export type RefreshToken = {
  jti: string
  ati: string
  iat: number
  aud: string
  sub: string
  exp: number // exp is in seconds
  scopes: Scope[]
}

export type AccessToken = RefreshToken

export type RawTokens = { idToken: string; refreshToken: string; accessToken: string }

export type Scope =
  | 'user.basic.read'
  | 'user.establishment.read'
  | 'user.booking.read'
  | 'user.clients.read'
  | 'user.clients.delete'

export const tokenFromJwt = <T>(token: string): T => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

export const oauthClientToken = (clientId: string, clientSecret: string): string => {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  return `Basic ${token}`
}

export type TokenFetcher = (refreshToken: string, tokenUrl: string, authorizationHeader: string) => Promise<RawTokens>

export const tokenFetcher: TokenFetcher = (userRefreshToken, tokenUrl, authorizationHeader) => {
  return new Promise<RawTokens>((resolve, reject) => {
    superagent
      .post(tokenUrl)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', authorizationHeader)
      .query({ refresh_token: userRefreshToken, grant_type: 'refresh_token' })
      .end((err, res) => {
        if (err) reject(err)
        const { id_token: idToken, access_token: accessToken, refresh_token: refreshToken } = res.body
        return resolve({ idToken, accessToken, refreshToken })
      })
  })
}
