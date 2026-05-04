## Flash of Unstyled Content (FOUC)
When implementing dark mode or themes, applying the theme via a deferred or module script can cause a white flash on initial page load as the DOM renders before the theme attribute is added to the HTML tag.
To fix this, a blocking, synchronous script should be placed in the `<head>` to read `localStorage` and apply the theme data attribute to `document.documentElement` immediately.

## Flash of Unstyled Content (FOUC)
When implementing dark mode or themes, applying the theme via a deferred or module script can cause a white flash on initial page load as the DOM renders before the theme attribute is added to the HTML tag.
To fix this, a blocking, synchronous script should be placed in the `<head>` to read `localStorage` and apply the theme data attribute to `document.documentElement` immediately.
