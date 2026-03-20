# Prisoner Facing Services Components / Lazy Load

This component performs a `GET` request to the specified host path when the element becomes visible to the user. When the request is completed the response HTML replaces the content within the div with the lazy load defined on it. 

NOTE: this can only used on local paths and not remote full URLS.

## Setup

1. In your client side js assets file import this module:

```js
import { lazyLoad } from '@ministryofjustice/hmpps-prisoner-facing-components/dist/assets/js/all'

lazyLoad.initAll()
```

2. Add the data tag `data-lazy-load` to the page markup where you would like the content to be lazy loaded.

```html
<div data-lazy-load="/content/header">
  <span class="loading=spinner"></span>
</div>
```

The value of the `data-lazy-load` data attribute is the path that will be used to perform a `GET` request against the current host.

3. Define the endpoint on your server side for the content to be loaded from

```ts
router.get('/content/header', (req, res, next) => res.render('partials/content/header'))
```

This content will replace the body of the tag containing the `data-lazy-load`.