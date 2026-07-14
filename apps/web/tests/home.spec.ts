import { expect, test } from "@playwright/test";

const configuredBaseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5174";
const configuredBasePath = new URL(configuredBaseURL).pathname;

function appPath(path: string): string {
  const basePath = configuredBasePath.endsWith("/") ? configuredBasePath : `${configuredBasePath}/`;
  return basePath === "/" ? path : `${basePath}${path.replace(/^\//, "")}`;
}

test("renders chapter homepage and resource search", async ({ page }) => {
  await page.goto(appPath("/"));
  await expect(page.getByRole("heading", { name: "Amharic DBpedia Chapter" })).toBeVisible();
  await expect(page.getByLabel("Resource title or IRI")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest news" })).toBeVisible();
  await expect(page.locator(".news-item")).toHaveCount(3);
  await expect(page.getByText("Tools & publications", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Docs" })).toBeVisible();
});

test("renders the tools and publications destination from the primary navigation", async ({
  page,
}) => {
  await page.goto(appPath("/"));
  await page.getByText("Tools & publications", { exact: true }).click();

  await expect(page).toHaveURL(new RegExp(`${appPath("/tools")}$`));
  await expect(page.getByRole("heading", { name: "Tools & publications" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Release contents" })).toBeVisible();
});

test("embeds Tentris inside the SPARQL page", async ({ page }) => {
  await page.goto(appPath("/sparql"));

  await expect(page.getByRole("heading", { name: "Tentris query workspace" })).toBeVisible();
  await expect(page.getByTitle("Amharic DBpedia Tentris query interface")).toHaveAttribute(
    "src",
    "https://am.dbpedia.data.dice-research.org/ui",
  );
});

test("renders the non-technical about page", async ({ page }) => {
  await page.goto(appPath("/about"));

  await expect(page.getByRole("heading", { name: "About Amharic DBpedia" })).toBeVisible();
  await expect(page.getByText("The idea in plain language")).toBeVisible();
  await expect(page.getByText("Why Amharic needs its own chapter")).toBeVisible();
});

test("renders chapter statistics on the homepage", async ({ page }) => {
  await page.goto(appPath("/#statistics"));

  await expect(page.getByRole("heading", { name: "Chapter at a glance" })).toBeVisible();
  await expect(page.getByText("97")).toBeVisible();
  await expect(page.locator(".metric__meter")).toHaveCount(4);
});

test("renders a dedicated resource landing page", async ({ page }) => {
  await page.goto(appPath("/resource"));

  await expect(page.getByRole("heading", { name: "Resource explorer" })).toBeVisible();
  await expect(page.getByLabel("Resource title or IRI")).toBeVisible();
  await expect(page.getByPlaceholder("ዳኛቸው ወርቁ")).toBeVisible();
  await expect(page.getByRole("link", { name: "አዲስ አበባ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ደብረ ብርሃን" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ኢትዮጵያ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ፓውል ሃርዲንግ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ዳኛቸው ወርቁ" })).toBeVisible();
});

test("resource route keeps Amharic titles readable when endpoint has no triples", async ({
  page,
}) => {
  await page.route("**/sparql?**", async (route) => {
    await route.fulfill({
      contentType: "application/sparql-results+json",
      body: JSON.stringify({ head: { vars: ["predicate", "object"] }, results: { bindings: [] } }),
    });
  });

  await page.goto(appPath("/resource/ዳኛቸው ወርቁ"));

  await expect(
    page.getByRole("link", { name: "http://am.dbpedia.org/resource/ዳኛቸው_ወርቁ" }),
  ).toBeVisible();
  await expect(page.getByText("No triples returned")).toBeVisible();
  await expect(page.getByText("%25E1")).toHaveCount(0);
});

test("resource predicate opens an explanatory property page", async ({ page }) => {
  await page.route("**/sparql?**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("query") ?? "";
    const isPredicateUsage = query.includes(
      "?subject <http://www.w3.org/2000/01/rdf-schema#label> ?object",
    );

    await route.fulfill({
      contentType: "application/sparql-results+json",
      body: JSON.stringify(
        isPredicateUsage
          ? {
              head: { vars: ["subject", "object"] },
              results: {
                bindings: [
                  {
                    subject: {
                      type: "uri",
                      value: "http://am.dbpedia.org/resource/ዳኛቸው_ወርቁ",
                    },
                    object: {
                      type: "literal",
                      value: "ዳኛቸው ወርቁ",
                      "xml:lang": "am",
                    },
                  },
                ],
              },
            }
          : {
              head: { vars: ["predicate", "object"] },
              results: {
                bindings: [
                  {
                    predicate: {
                      type: "uri",
                      value: "http://www.w3.org/2000/01/rdf-schema#label",
                    },
                    object: {
                      type: "literal",
                      value: "ዳኛቸው ወርቁ",
                      "xml:lang": "am",
                    },
                  },
                ],
              },
            },
      ),
    });
  });

  await page.goto(appPath("/resource/ዳኛቸው ወርቁ"));
  const predicate = page.getByRole("link", { name: "rdfs:label" });

  await expect(predicate).toHaveAttribute(
    "href",
    new RegExp(`${appPath("/property/http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label")}$`),
  );
  await predicate.click();

  await expect(page.getByRole("heading", { name: "label" })).toBeVisible();
  await expect(
    page.locator(".property-header").getByText("A human-readable name for the subject resource."),
  ).toBeVisible();
  await expect(page.getByText("Read this as RDF")).toBeVisible();
  await expect(page.getByText("Use this property to find the display name")).toBeVisible();
  await expect(page.getByText("Triple pattern")).toBeVisible();
  await expect(page.getByText("Usage in Amharic DBpedia")).toBeVisible();
  await expect(page.getByRole("link", { name: "am:ዳኛቸው ወርቁ" })).toBeVisible();
});
