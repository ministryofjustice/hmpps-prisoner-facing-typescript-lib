# Prisoner Facing Services Components / Launchpad Header

Provides a header bar styled as Launchpad for use in prisoner facing applications.

## Setup

Ensure you have followed the setup instructions in the [main README](../../../../../README.md) for this package.

## Usage

Simply import the nunjucks macro:

```njk
{% from "pfs/components/launchpad-header/macro.njk" import launchpadHeader %}
```

And put it in your markup:

```njk
{{ launchpadHeader(user, languageOptions) }}
```

### Parameters

|user|This is the current user (`LaunchpadUser` or object which confoms to `{ name: string }`), their name will be displayed in the header bar|
|languageOptions|The language choices that will appear for the user to select. See `LaunchpadHeaderParameters` type to help your code conform to this parameter|

### Example languageOptions setup

In an express middleware:

```ts
import { LanguageOption } from '@ministryofjustice/hmpps-prisoner-facing-components'

const translationHref = (code: string): string => {
  const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
  url.searchParams.set('lng', code)
  return url.toString()
}

const languageOptions: LanguageOption[] = [
  { code: 'en', label: 'English', href: translationHref('en'), isCurrent: req.language === 'en' },
  { code: 'cy', label: 'Cymraeg', href: translationHref('cy'), isCurrent: req.language === 'cy' },
  // ... etc
]

res.locals.languageOptions = languageOptions
```
