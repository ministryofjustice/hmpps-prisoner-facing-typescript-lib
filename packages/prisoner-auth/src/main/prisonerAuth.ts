import OpenIDConnectStrategy, { Profile, VerifyCallback, VerifyFunction } from 'passport-openidconnect'
import { IdToken, oauthClientToken, RefreshToken, Scope, tokenFromJwt, tokenFetcher, TokenFetcher } from './tokens'
import { LaunchpadUser, userFromTokens } from './launchpadUser'
import { seconds, timeFromNow, TimeSpan } from './timeSpans'

export type PrisonerAuthOptions = {
  /** The full URL of the Launchpad Auth instance */
  launchpadAuthUrl: string

  /**
   * Optional: The full URL of the authorisation path on the Launchpad Auth instance.
   *
   * If omitted, authorizationUrl will default to $launchpadAuthUrl/v1/oauth2/authorize
   */
  authorizationUrl?: string

  /**
   * Optional: The full URL of the token path on the Launchpad Auth instance.
   *
   * If omitted, tokenUrl will default to $launchpadAuthUrl/v1/oauth2/token
   */
  tokenUrl?: string

  /**
   * Optional: The URL or path that Launchpad Auth will be told to call back to with the tokens.
   *
   * If omitted, callbackUrl will default to /sign-in/callback
   */
  callbackUrl?: string

  /**
   * Optional: A callback that will be invoked on sucessful login, provides the logged in user as a parameter
   */
  onLoginSuccessCallback?: OnLoginSuccessCallback

  /** The Client ID of this application to send to Launchpad Auth */
  clientId: string
  /** The Client Secret of this application to send to Launchpad Auth */
  clientSecret: string
  /**
   * Optional: The scope or scopes to request on behalf of the user.
   *
   * If omitted, scope will default to user.basic.read, user.establishment.read and user.booking.read
   */
  scope?: Scope | Scope[]
  /**
   * Optional: Whether or not to use nonce, not recommended to be disabled except for integration tests
   *
   * If ommitted. defaults to true
   */
  nonce?: boolean

  /**
   * A time span specifying the least amount of time a token must have left before it is considered expired.
   *
   * @example
   *
   * Token will be considered expired when its exp value is in the past.
   * ```ts
   * nothing()
   * ```
   *
   * Token will be considered expired unless its exp value is **AT LEAST 5** minutes in the future from time of checking.
   * ```ts
   * minutes(5)
   * ```
   *
   * @see TimeSpan
   */
  tokenMinimumLifespan: TimeSpan

  /**
   * Optional: Token fetcher implementation. Intended for unit testing PrisonerAuth
   *
   * @see TokenFetcher
   */
  tokenFetcher?: TokenFetcher
}

export type OnLoginSuccessCallback = (user: LaunchpadUser) => Promise<void>
const nullOnLoginSuccessCallback: OnLoginSuccessCallback = _ => Promise.resolve()

export default class PrisonerAuth {
  readonly launchpadAuthUrl: string

  readonly authorizationUrl: string

  readonly tokenUrl: string

  readonly callbackUrl: string

  readonly onLoginSuccessCallback: OnLoginSuccessCallback

  readonly clientId: string

  readonly clientSecret: string

  readonly scope: Scope | Scope[]

  readonly nonce: boolean

  readonly tokenMinimumLifespan: TimeSpan

  readonly tokenFetcher: TokenFetcher

  constructor(options: PrisonerAuthOptions) {
    this.launchpadAuthUrl = options.launchpadAuthUrl
    this.authorizationUrl = options.authorizationUrl ?? `${options.launchpadAuthUrl}/v1/oauth2/authorize`
    this.tokenUrl = options.tokenUrl ?? `${options.launchpadAuthUrl}/v1/oauth2/token`
    this.callbackUrl = options.callbackUrl ?? '/sign-in/callback'
    this.onLoginSuccessCallback = options.onLoginSuccessCallback ?? nullOnLoginSuccessCallback
    this.clientId = options.clientId
    this.clientSecret = options.clientSecret
    this.scope = options.scope ?? ['user.basic.read', 'user.establishment.read', 'user.booking.read']
    this.nonce = options.nonce ?? true
    this.tokenMinimumLifespan = options.tokenMinimumLifespan
    this.tokenFetcher = options.tokenFetcher ?? tokenFetcher
  }

  /**
   *
   * @returns OpenIDConnectStrategy ready for use with passport
   */
  passportStrategy(): OpenIDConnectStrategy {
    return new OpenIDConnectStrategy(
      {
        issuer: this.launchpadAuthUrl,
        authorizationURL: this.authorizationUrl,
        tokenURL: this.tokenUrl,
        callbackURL: this.callbackUrl,
        clientID: this.clientId,
        clientSecret: this.clientSecret,
        scope: this.scope,
        userInfoURL: '',
        skipUserProfile: true,
        nonce: this.nonce ? 'true' : undefined,
        customHeaders: { authorization: this.authorizationToken() },
      },
      (async (
        _issuer: string,
        _profile: Profile,
        _context: object,
        idToken: string,
        accessToken: string,
        refreshToken: string,
        done: VerifyCallback,
      ) => {
        const user = userFromTokens({ idToken, accessToken, refreshToken })
        await this.onLoginSuccessCallback(user)
        done(null, user)
      }) as VerifyFunction,
    )
  }

  /**
   * Checks the expiry of a given LaunchpadUser idToken and refreshToken.
   * - If the idToken has expired it will attempt to refresh it using the refreshToken.
   * - If the refreshToken has expired it will throw an Error.
   *
   * This method will always return a LaunchpadUser so it is suggested to updated your local copy and it will keep the tokens up to date.
   *
   * @param user - The LaunchpadUser instance to check token expiry on.
   * @returns A LaunchpadUser is always returned, either the given user or a user with refreshed tokens.
   * @throws Error is thrown if the refreshToken has expired, the user must sign in again from scratch.
   */
  async validateAndRefreshUser(user: LaunchpadUser): Promise<LaunchpadUser> {
    const idToken = tokenFromJwt<IdToken>(user.idToken)
    const refreshToken = tokenFromJwt<RefreshToken>(user.refreshToken)
    const tokenExpiryTime = timeFromNow(this.tokenMinimumLifespan)

    // Id Token still valid, return the current user
    if (seconds(idToken.exp).isGreaterThanOrEqualTo(tokenExpiryTime)) {
      return user
    }

    // Refresh token expired, cannot continue
    if (seconds(refreshToken.exp).isLessThan(tokenExpiryTime)) {
      throw new Error('Refresh token expired')
    }

    // Refresh the user tokens
    const newTokens = await this.tokenFetcher(user.refreshToken, this.tokenUrl, this.authorizationToken())
    return userFromTokens(newTokens)
  }

  private authorizationToken(): string {
    return oauthClientToken(this.clientId, this.clientSecret)
  }
}
