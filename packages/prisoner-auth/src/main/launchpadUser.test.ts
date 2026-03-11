import jwt from 'jsonwebtoken'
import { userFromTokens } from './launchpadUser'

describe('userFromTokens', () => {
  const aJwtOf = (obj: object): string => jwt.sign(obj, 'secret')

  const idToken = aJwtOf({
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    establishment: { agency_id: 'CKI' },
    sub: '12345',
  })
  const accessToken = aJwtOf({ hello: 'world' })
  const refreshToken = aJwtOf({ hello: 'world' })

  it('sets the given tokens on the user for later use (refreshing tokens)', () => {
    const result = userFromTokens({ idToken, accessToken, refreshToken })

    expect(result.idToken).toEqual(idToken)
    expect(result.accessToken).toEqual(accessToken)
    expect(result.refreshToken).toEqual(refreshToken)
  })

  it('sets the establishment from the idToken', () => {
    const result = userFromTokens({ idToken, accessToken, refreshToken })
    expect(result.establishment).toEqual({ agency_id: 'CKI' })
  })

  it('sets the name fields from the idToken', () => {
    const result = userFromTokens({ idToken, accessToken, refreshToken })
    expect(result.name).toEqual('Test User')
    expect(result.givenName).toEqual('Test')
    expect(result.familyName).toEqual('User')
  })

  it('sets authSource to give compatibility with the HmppsUser interface', () => {
    const result = userFromTokens({ idToken, accessToken, refreshToken })
    expect(result.authSource).toEqual('prisoner-auth')
  })
})
