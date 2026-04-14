import jwt from 'jsonwebtoken'
import { userFromTokens } from './launchpadUser'

describe('userFromTokens', () => {
  const aJwtOf = (obj: object): string => jwt.sign(obj, 'secret')

  const parsedIdToken = {
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    establishment: { agency_id: 'CKI' },
    sub: '12345',
    iat: 1775000000, // not checked
  }
  const idToken = aJwtOf(parsedIdToken)
  const accessToken = aJwtOf({ hello: 'world' })
  const refreshToken = aJwtOf({ hello: 'world' })

  it('sets the given tokens on the user for later use (refreshing tokens)', () => {
    const result = userFromTokens({ idToken, accessToken, refreshToken })

    expect(result.idToken).toEqual(parsedIdToken)
    expect(result.accessToken).toEqual(accessToken)
    expect(result.refreshToken).toEqual(refreshToken)
  })

  it('sets authSource to give compatibility with the HmppsUser interface', () => {
    const result = userFromTokens({ idToken, accessToken, refreshToken })
    expect(result.authSource).toEqual('prisoner-auth')
  })
})
