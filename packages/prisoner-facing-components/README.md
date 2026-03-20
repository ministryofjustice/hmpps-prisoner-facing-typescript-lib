# Prisoner Facing Services Components

This module defines a number of components intened for use when developing prisoner facing applications.

## Front end components

- [launchpad-header](src/assets/pfs/components/launchpad-header)
- [lazy-load](src/assets/pfs/components/lazy-load)

## Installation

1. Add the npm module

```bash
npm install --save @ministryofjustice/hmpps-prisoner-facing-components
```

2. Configure nunjucks for importing macros (usually found in `server/utils/nunjucksSetup.ts`)

```ts
const njkEnv = nunjucks.configure(
  [
    ...,
    'node_modules/@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/',
  ],
  {
    autoescape: true,
    express: app,
    ...
  },
)
```

Then you can import the component you wish to use

```njk
{% from "dps/components/header/macro.njk" import launchpadHeader %}
```

3. Setup the styling in your `assets/scss/index.scss`

Either add all styles

```scss
  @import 'node_modules/@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/scss/all';
```

or just the components you wish to use

```scss
  @import 'node_modules/@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/pfs/components/header/header';
```

4. Add any client side javascript you wish to use

Within your client side javascript, include:

```js
import * as pfsComponents from '@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/js/all'
pfsComponents.initAll()
```

or just the components you wish to use:

```js
import { lazyLoad } from '@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/js/all'
lazyLoad.initAll()
```
