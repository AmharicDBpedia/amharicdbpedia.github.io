# PR interface screenshots

Captured from the running frontend using Playwright Desktop Chromium. Graph data
and the endpoint error are controlled test fixtures, not live-service observations.
Component screenshots hide the unrelated sticky site header to avoid obscuring
their headings; the 404 screenshot includes the full page.

- `visualization.png`: 1,000 synthetic triples, 2,000 graph nodes, selected resource,
  and the virtualized facts viewport scrolled halfway through the page.
- `404-page.png`: unknown website route with Home, Resources, and resource search.
- `sparql-error.png`: simulated HTTP 504 response, preserved query, retry action,
  published-dataset link, and expanded technical details.

Regenerate desktop and mobile captures in `apps/web/test-results/`:

```sh
pnpm --filter @amdb/web exec playwright test --grep 'virtualizes a thousand|missing pages|query retry'
```
