# Prisoner Auth

## Installation

### Quick installation

The following steps will give an opinionated out of the box setup for applications where a launchpad user will be the main user in the system.

1. Add the package `@ministryofjustice/hmpps-prisoner-auth` to your `package.json`
```
$ npm add --save @ministryofjustice/hmpps-prisoner-auth
$ npm i
```
2. Copy the contents of [src/misc/install.diff](src/misc/install.diff) to your local folder
```
$ curl https://raw.githubusercontent.com/ministryofjustice/hmpps-prisoner-facing-typescript-lib/refs/heads/main/packages/prisoner-auth/src/misc/install.diff > install.diff
```
3. Apply the diff to carry out all the required changes
```
$ git apply install.diff
```
4. Make sure to look through the applied changes and remove the diff file before committing.

### Manual installation

1. Add the package `@ministryofjustice/hmpps-prisoner-auth` to your `package.json`
```
$ npm add --save @ministryofjustice/hmpps-prisoner-auth
$ npm i
```
2. Modify `interfaces/hmppsUser.ts` to make the following additions:
```
# add prisoner-auth to the AuthSource type
export type AuthSource = 'nomis' | 'delius' | 'external' | 'azuread' | 'prisoner-auth'

# add LaunchpadUser to the HmppsUser type
export type HmppsUser = PrisonUser | ProbationUser | ExternalUser | AzureADUser | LaunchpadUser
```
These changes will help smooth over alot of assumptions made in the typescript template about the type of fields the user will have.

3. Modify `server/middleware/setupAuthentication.ts` to add prisoner auth as the passport strategy (see below for the full list of config options):
```
passport.use(
  'prisoner-auth',
  prisonerAuthStrategy(
    {
      launchpadAuthUrl: 'https://launchpad.instance.etc' ...
    }
  )
)
```
Note: it is recommended to give the strategy a name ('prisoner-auth' here) for later referral with passport.authenticate middleware.

4. Modify `server/middleware/setupAuthentication.ts` to remove any hmpps auth specific code and add in prisoner auth setup. The following code snippet is intended as a guide:
```
export default function setupAuthentication() {
  const router = Router()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('prisoner-auth'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('prisoner-auth', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next),
  )

  router.use('/sign-out', (req, res, next) => {
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect('/'))
      })
    } else res.redirect('/')
  })

  router.use(async (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl
      return res.redirect('/sign-in')
    }

    return prisonerAuth
      .validateAndRefreshUser(req.user as LaunchpadUser)
      .then(user => {
        req.user = user
        next()
      })
      .catch(() => res.redirect('/autherror'))
  })
  
  router.use((req, res, next) => {
    res.locals.user = req.user as HmppsUser
    next()
  })

  return router
}
```
5. You may wish to remove the following middleware from `server/app.ts` as they were not designed for use with `LaunchpadUser`:
  - `authorisationMiddleware()` - this checks the users `ROLE_` which a launchpad user will not have.
  - `setUpCurrentUser()` - this sets up the `res.locals.user` fields which a launchpad will have already (`name`, `displayName` etc).

### Configuration Options

| Option | Description |
| - | - |
| launchpadAuthUrl | The full URL of the launchpad auth instance you wish to authenticate against |
| clientID | The client ID |
| clientSecret | The client secret |
| callbackURL | *Optional, The URL or path you wish launchpad to call back to in the auth flow. Defaults to `/signin/callback` |
| scope | *Optional, One or more OpenIdConnect Scopes you require for the application. Defaults to `['user.basic.read', 'user.establishment.read', 'user.booking.read']` |
| tokenMinimumLifespan | The least amount of time a token must have left before it is considered expired. Expressed as a TimeSpan. eg. `minutes(5)` or `nothing()`. |

See `PrisonerAuthOptions` for full list and documentation for these options.
