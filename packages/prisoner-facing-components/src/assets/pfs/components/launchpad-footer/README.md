# Prisoner Facing Services Components / Launchpad Footer

Provides a footer styled as Launchpad for use in prisoner facing applications.

## Setup

Ensure you have followed the setup instructions in the [main README](../../../../../README.md) for this package.

Ensure you have the `govuk-frontend` npm module installed in your client application with the CSS loaded correctly.

## Usage

1. For type hinting to help you with the configuration of the footer, you can extend `Express.Locals` with `LaunchpadFooterLocals` in your `server/@types/express/index.d.ts`:

```ts
import { LaunchpadFooterLocals } from '@ministryofjustice/hmpps-prisoner-facing-components'

// ... further down ...

export declare global {
  namespace Express {
    // .. etc ..
    interface Locals extends LaunchpadFooterLocals {
      // .. etc ..
    }
  }
}
```

2. Then in a middleware you need to set up the launchpad footer options to be used in the view:

##### Simple list of links

```ts
res.locals.launchpadFooterConfig = {
  meta: {
    hiddenDescription: 'Links',
    items: [{ href: '/external/privacy-policy', label: 'Privacy Policy', attributes: { target: '_blank' } }],
  },
}
```

See example from [govuk design system](https://design-system.service.gov.uk/components/footer/with-meta/)

Note: you can see this implemented in [launchpad home here](https://github.com/ministryofjustice/hmpps-launchpad-home-ui/blob/main/server/middleware/setUpLaunchpadFooter.ts)

<details>

<summary>See more examples</summary>

##### Multiple columns with headers

```ts
res.locals.launchpadFooterConfig = {
  navigation: [
    {
      header: 'List 1',
      width: 'two-thirds',
      columns: 2,
      items: [
        { href: '/external/link-1', label: 'Link 1', attributes: { target: '_blank' } },
        { href: '/external/link-2', label: 'Link 2', attributes: { target: '_blank' } },
        { href: '/external/link-3', label: 'Link 3', attributes: { target: '_blank' } },
        { href: '/external/link-4', label: 'Link 3', attributes: { target: '_blank' } },
        { href: '/external/link-5', label: 'Link 3', attributes: { target: '_blank' } },
      ],
    },
    {
      header: 'List 2',
      width: 'one-third',
      items: [{ href: '/external/link-6', label: 'Link 6', attributes: { target: '_blank' } }],
    },
  ],
}
```

See example from [govuk design system](https://design-system.service.gov.uk/components/footer/with-navigation/)

##### BOTH simple links AND Multiple columns with headers

```ts
res.locals.launchpadFooterConfig = {
  meta: {
    hiddenDescription: 'Links',
    items: [{ href: '/external/privacy-policy', label: 'Privacy Policy', attributes: { target: '_blank' } }],
  },
  navigation: [
    {
      header: 'List 1',
      width: 'two-thirds',
      columns: 2,
      items: [
        { href: '/external/link-1', label: 'Link 1', attributes: { target: '_blank', 'data-do-something': true } },
        { href: '/external/link-2', label: 'Link 2', attributes: { target: '_blank' } },
        { href: '/external/link-3', label: 'Link 3', attributes: { target: '_blank' } },
        { href: '/external/link-4', label: 'Link 3', attributes: { target: '_blank' } },
        { href: '/external/link-5', label: 'Link 3', attributes: { target: '_blank' } },
      ],
    },
    {
      header: 'List 2',
      width: 'one-third',
      items: [{ href: '/external/link-6', label: 'Link 6', attributes: { target: '_blank' } }],
    },
  ],
}
```

See example from [govuk design system](https://design-system.service.gov.uk/components/footer/full/)

</details>

3. Add the macro to your view file:

```njk
{% from "pfs/components/launchpad-footer/macro.njk" import launchpadFooter %}

{{ launchpadFooter(launchpadFooterConfig) }}
```
