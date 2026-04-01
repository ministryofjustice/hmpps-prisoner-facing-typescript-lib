import { minutes, timeAgo, timeFromNow } from './timeSpans'
import PrisonerAuth, { PrisonerAuthOptions } from './prisonerAuth'
import { LaunchpadUser } from './launchpadUser'
import { AccessToken, RefreshToken, tokenFromJwt } from './tokens'
import { aJwtOf, aUserWith } from './testUtils'

describe('PrisonerAuth', () => {
  const options: PrisonerAuthOptions = {
    launchpadAuthUrl: 'https://launchpad.example.com',
    clientId: 'cf837899-2a3c-4838-aa83-5fb76bd58df1',
    clientSecret: '445f30b2-1010-4bcb-8cba-447b70463bd0',
    tokenMinimumLifespan: minutes(5),
  }

  describe('setting options', () => {
    it('sets sane defaults for the URL options', () => {
      const prisonerAuth = new PrisonerAuth(options)
      expect(prisonerAuth.authorizationUrl).toEqual('https://launchpad.example.com/v1/oauth2/authorize')
      expect(prisonerAuth.tokenUrl).toEqual('https://launchpad.example.com/v1/oauth2/token')
    })

    it('allows custom override of the URL options', () => {
      const prisonerAuth = new PrisonerAuth({
        ...options,
        authorizationUrl: 'https://auth.com',
        tokenUrl: 'https://token.com',
      })
      expect(prisonerAuth.authorizationUrl).toEqual('https://auth.com')
      expect(prisonerAuth.tokenUrl).toEqual('https://token.com')
    })

    it('sets the client credentials', () => {
      const prisonerAuth = new PrisonerAuth(options)
      expect(prisonerAuth.clientId).toEqual('cf837899-2a3c-4838-aa83-5fb76bd58df1')
      expect(prisonerAuth.clientSecret).toEqual('445f30b2-1010-4bcb-8cba-447b70463bd0')
    })

    it('allows overriding of the callbackUrl', () => {
      const prisonerAuth = new PrisonerAuth({ ...options, callbackUrl: '/my/call/back' })
      expect(prisonerAuth.callbackUrl).toEqual('/my/call/back')
    })

    it('sets a default callbackUrl when none provided', () => {
      const prisonerAuth = new PrisonerAuth(options)
      expect(prisonerAuth.callbackUrl).toEqual('/sign-in/callback')
    })

    it('allows overriding of the scopes', () => {
      const prisonerAuth = new PrisonerAuth({ ...options, scope: 'user.basic.read' })
      expect(prisonerAuth.scope).toEqual('user.basic.read')
    })

    it('sets a default scope of all read only scopes when no scopes given', () => {
      const prisonerAuth = new PrisonerAuth(options)
      expect(prisonerAuth.scope).toEqual(['user.basic.read', 'user.establishment.read', 'user.booking.read'])
    })
  })

  describe('validateAndRefreshUser', () => {
    describe('when the users idToken has not yet expired', () => {
      it('returns the user as it is', async () => {
        const prisonerAuth = new PrisonerAuth(options)
        const user = aUserWith({
          idTokenExp: timeFromNow(minutes(6)).seconds,
          refreshTokenExp: timeFromNow(minutes(6)).seconds,
        })

        const { idToken } = await prisonerAuth.validateAndRefreshUser(user as LaunchpadUser)

        expect(idToken.iat).toEqual(123_456_789)
      })
    })

    describe('when the users idToken has expired', () => {
      describe('when the users refreshToken has not yet expired', () => {
        it('returns a new set of user tokens for the given user', async () => {
          const prisonerAuth = new PrisonerAuth({
            ...options,
            tokenFetcher: jest.fn().mockResolvedValue({
              idToken: aJwtOf({ iat: 987_654_321 }),
              refreshToken: aJwtOf({ iat: 987_654_322 }),
              accessToken: aJwtOf({ iat: 987_654_323 }),
            }),
          })
          const user = aUserWith({
            idTokenExp: timeAgo(minutes(3)).seconds,
            refreshTokenExp: timeFromNow(minutes(6)).seconds,
          })

          const result = await prisonerAuth.validateAndRefreshUser(user as LaunchpadUser)
          const { idToken } = result
          const refreshToken = tokenFromJwt<RefreshToken>(result.refreshToken)
          const accessToken = tokenFromJwt<AccessToken>(result.accessToken)

          expect(idToken.iat).toEqual(987_654_321)
          expect(refreshToken.iat).toEqual(987_654_322)
          expect(accessToken.iat).toEqual(987_654_323)
        })
      })

      describe('when the users refreshToken has expired', () => {
        it('throws an error as we cant continue', async () => {
          const prisonerAuth = new PrisonerAuth(options)
          const user = aUserWith({
            idTokenExp: timeAgo(minutes(3)).seconds,
            refreshTokenExp: timeFromNow(minutes(3)).seconds,
          })

          await expect(async () => {
            await prisonerAuth.validateAndRefreshUser(user as LaunchpadUser)
          }).rejects.toThrow('Refresh token expired')
        })
      })
    })
  })
})
