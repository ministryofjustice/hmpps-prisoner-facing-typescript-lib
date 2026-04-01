# Prisoner Auth

## Installation

### Quick installation

The following steps will give an opinionated out of the box setup for applications where a launchpad user will be the main user in the system.

1. Add the package `@ministryofjustice/hmpps-prisoner-auth` to your `package.json`
```sh
npm add --save @ministryofjustice/hmpps-prisoner-auth
npm i
```

2. Copy the contents of [src/misc/install.diff](src/misc/install.diff) to your local folder
```sh
curl https://raw.githubusercontent.com/ministryofjustice/hmpps-prisoner-facing-typescript-lib/refs/heads/main/packages/prisoner-auth/src/misc/install.diff > install.diff
```

3. Apply the diff to carry out all the required changes
```sh
git apply install.diff
```

4. Make sure to look through the applied changes and remove the diff file before committing.

5. Fill in the configuration options in `server/middleware/setUpPrisonerAuth.ts`:

See [PrisonerAuthOptions](https://raw.githubusercontent.com/ministryofjustice/hmpps-prisoner-facing-typescript-lib/refs/heads/main/packages/prisoner-auth/src/main/prisonerAuth.ts) for full documentation on the avaialble options

### Manual installation

NOTE: see [install.diff](https://raw.githubusercontent.com/ministryofjustice/hmpps-prisoner-facing-typescript-lib/refs/heads/main/packages/prisoner-auth/src/misc/install.diff) for an authorititive list of changes to be made.

1. Add the package `@ministryofjustice/hmpps-prisoner-auth` to your `package.json`
```sh
npm add --save @ministryofjustice/hmpps-prisoner-auth
npm i
```

2. Modify `interfaces/hmppsUser.ts` to make the following additions:
```ts
# add prisoner-auth to the AuthSource type
export type AuthSource = 'nomis' | 'delius' | 'external' | 'azuread' | 'prisoner-auth'

# add LaunchpadUser to the HmppsUser type
export type HmppsUser = PrisonUser | ProbationUser | ExternalUser | AzureADUser | LaunchpadUser
```
These changes will help smooth over alot of assumptions made in the typescript template about the type of fields the user will have.

3. Add `server/middleware/setUpPrisonerAuth.ts` middlware:

```sh
curl https://raw.githubusercontent.com/ministryofjustice/hmpps-prisoner-facing-typescript-lib/refs/heads/main/packages/prisoner-auth/src/misc/setUpPrisonerAuth.ts.example > server/middleware/setUpPrisonerAuth.ts
```
Make sure to fill in the appropriate values.

See [PrisonerAuthOptions](https://raw.githubusercontent.com/ministryofjustice/hmpps-prisoner-facing-typescript-lib/refs/heads/main/packages/prisoner-auth/src/main/prisonerAuth.ts) for full documentation on the avaialble options

4. Modify `server/app.ts`:
  - ADD `setUpPrisonerAuth()` to enable the middlware.
  - REMOVE reference to `authorisationMiddleware()` - this checks the users `ROLE_` which a launchpad user will not have.
  - REMOVE reference to `setUpCurrentUser()` - this sets up the `res.locals.user` fields which a launchpad will have already (`name`, `displayName` etc).
