# Prisoner Facing Services Components / Launchpad Footer

Provides a footer styled as Launchpad for use in prisoner facing applications.

## Setup

Ensure you have followed the setup instructions in the [main README](../../../../../README.md) for this package.

## Usage

Simply import the nunjucks macro:

```njk
{% from "pfs/components/launchpad-footer/macro.njk" import launchpadFooter %}
```

And put it in your markup:

```njk
{{ launchpadFooter() }}
```