# Prisoner Facing Services Components / Launchpad Header

Provides a header bar styled as Launchpad for use in prisoner facing applications.

## Setup

Ensure you have followed the setup instructions in the [main README](../../../../../README.md) for this package.

## Usage

1. For type hinting to help you with the configuration of the header, you can extend `Express.Locals` with `LaunchpadHeaderLocals` in your `server/@types/express/index.d.ts`:

```ts
import { LaunchpadHeaderLocals } from '@ministryofjustice/hmpps-prisoner-facing-components'

// ... further down ...

export declare global {
  namespace Express {
    // .. etc ..
    interface Locals extends LaunchpadHeaderLocals {
      // .. etc ..
    }
  }
}
```

2. Then in a middleware you need to set up the launchpad header options to be used in the view:

```ts
res.locals.launchpadHeaderConfig = {
  user: { name: req.user.name },
  translations: {
    enabled: true,
    currentLanguageCode: req.language,
    options: [
      { href: hrefOf('en'), code: 'en', label: 'English' },
      { href: hrefOf('cy'), code: 'cy', label: 'Cymraeg' },
    ],
  },
}
```

Note: you can see this implemented in [launchpad home here](https://github.com/ministryofjustice/hmpps-launchpad-home-ui/blob/main/server/middleware/setUpLaunchpadHeader.ts)

3. Add the macro to your view file:

```njk
{% from "pfs/components/launchpad-header/macro.njk" import launchpadHeader %}

{{ launchpadHeader(launchpadHeaderConfig) }}
```