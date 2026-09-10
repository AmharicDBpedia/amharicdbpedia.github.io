# Resources knowledge explorer

The Resources page (`/tools`) combines a live relationship map, selected-resource
inspector, and virtualized RDF facts. The existing directory, downloads, mappings,
SPARQL workspace, and publication remain accessible.

## Rendering and data boundaries

- `d3-delaunay` indexes node positions for pointer hit-testing. Canvas draws **RDF
  edges**, never triangulation edges. A deterministic subject-centered layout avoids
  continuous force-simulation work. Drawing is scheduled at most once per animation
  frame, pixel density is capped at 2, and labels and node sizes adapt to density.
- Vanilla TypeScript uses TanStack Virtual's `@tanstack/virtual-core` package.
  Fixed 52px rows plus five overscan rows keep DOM size proportional to the viewport.
  RDF term language, datatype, and blank-node identity remain visible in the table.
- SPARQL requests ask for 1,001 rows: 1,000 displayed triples plus a next-page sentinel.
  Only the current page is retained. No full-dataset count or full-dataset download
  is required. A page can produce up to 2,000 resource nodes and 1,000 edges.
- Titles and HTTP IRIs scope queries to an exact resource's incoming and outgoing
  facts, not a full-text search. The incoming branch excludes self-loops already
  returned by the outgoing branch.
  The UI describes the loaded slice; it never presents page counts as global totals.
- Requests time out after 20 seconds. New searches and navigation abort previous
  requests. Route disposal disconnects resize/scroll observers and cancels drawing.

## Limits

Ordered `LIMIT`/`OFFSET` paging works with the existing SELECT endpoint but deep
offsets and sorting can be expensive on the **server**. Dataset changes between
requests can move rows between pages. A future snapshot-aware cursor API would
improve this; virtualization does not solve endpoint latency or consistency.
Millions of triples are browsed in bounded pages, not loaded into one enormous
browser array or one physically unbounded scrollbar.

The graph projects URI subjects and URI objects. Literals and blank nodes are
retained in facts but are not graph edges. It shows a bounded one-hop neighborhood
for a searched resource, not a complete multi-hop graph. Arrowheads mark
the direction of highlighted connections, and predicates are shown in the inspector.

The endpoint must be reachable from the browser and permit cross-origin requests.
Failures render a retryable error; there is no fabricated fallback dataset. During
implementation the public endpoint returned `Bad Gateway`, so automated rendering
verification uses explicitly mocked RDF responses, not a claim of live-data uptime.

## Validation

```sh
pnpm check:frontend
pnpm test:e2e
VITE_BASE_PATH=/website/ PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174/website/ pnpm test:e2e
```

Tests cover RDF projection, query input validation, page bounds, malformed data,
language/datatype preservation, a 1,000-triple / 2,000-node browser fixture, bounded
DOM row counts after scrolling, pagination, mouse and keyboard selection, failed
requests, empty results, superseded searches, and route navigation on desktop and
mobile. Browser screenshots and failure traces are retained as CI artifacts.

## Design

The page is a research atlas for readers exploring Amharic Wikipedia relationships.
Its palette is paper blue `#f0f6fb`, ink `#18364c`, subject blue `#214868`, linked-resource
teal `#168383`, selection gold `#ae7115`, and divider blue `#b9cedc`. The existing
Ethiopic body-font stack is retained, with a restrained Avenir/Trebuchet display
stack and monospace utility labels. No new font download is required.
The map with Amharic labels is the main visual feature; surrounding controls remain
quiet. The inspector moves beneath it on narrow screens. Zoom buttons, arrow-key
selection, visible focus, and fact-row actions supplement pointer interaction.
There is no continuous or decorative animation.

References: [Delaunay hit-testing](https://d3js.org/d3-delaunay/delaunay#delaunay_find)
and [TanStack Virtual installation](https://tanstack.com/virtual/latest/docs/installation).
