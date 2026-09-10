import { expect, test } from "@playwright/test";

const basePath = new URL(
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5174/",
).pathname.replace(/\/$/, "");
const app = (path: string) => `${basePath}${path}`;
const empty = JSON.stringify({
  head: { vars: ["subject", "predicate", "object"] },
  results: { bindings: [] },
});

test("gateway failure offers recovery and leaves the search intact", async ({ page }, testInfo) => {
  let status = 502;
  await page.route("**/sparql?**", (route) =>
    route.fulfill({
      status,
      contentType: "application/sparql-results+json",
      body: status === 200 ? empty : "private upstream failure",
    }),
  );
  await page.goto(app("/tools"));
  await page.getByLabel("Explore a resource", { exact: true }).fill("ዳኛቸው ወርቁ");
  await page.getByRole("button", { name: "Explore connections" }).click();
  const alert = page.getByRole("alert");
  await expect(alert.getByRole("heading")).toHaveText(
    "The data service is temporarily unavailable",
  );
  await expect(page.locator(".atlas-workspace")).toBeHidden();
  await alert.getByText("Technical details").click();
  await expect(alert).toContainText("HTTP 502");
  await expect(page.getByText("private upstream failure")).toHaveCount(0);
  await expect(alert.getByRole("link", { name: "Browse published datasets" })).toHaveAttribute(
    "href",
    app("/tools#datasets"),
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("gateway-recovery.png"), fullPage: true });
  status = 200;
  await alert.getByRole("button", { name: "Retry loading" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByLabel("Explore a resource", { exact: true })).toHaveValue("ዳኛቸው ወርቁ");
  await expect(page.locator(".atlas-status")).toContainText("No facts found");
});

test("network failure has actionable copy", async ({ page }) => {
  await page.route("**/sparql?**", (route) => route.abort("failed"));
  await page.goto(app("/tools"));
  await expect(page.getByRole("alert")).toContainText("Cannot reach the data service");
  await expect(page.getByText("Failed to fetch", { exact: true })).toHaveCount(0);
});

test("offline searches can be retried after reconnecting", async ({ page, context }) => {
  await page.route("**/sparql?**", (route) =>
    route.fulfill({ contentType: "application/sparql-results+json", body: empty }),
  );
  await page.goto(app("/tools"));
  await expect(page.locator(".atlas-status")).toContainText("No facts found");
  await page.unroute("**/sparql?**");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Browse all", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("You appear to be offline");
  await context.setOffline(false);
  await page.route("**/sparql?**", (route) =>
    route.fulfill({ contentType: "application/sparql-results+json", body: empty }),
  );
  await page.getByRole("button", { name: "Retry loading" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("service HTTP 404 is not confused with the website 404", async ({ page }) => {
  await page.route("**/sparql?**", (route) => route.fulfill({ status: 404, body: "not found" }));
  await page.goto(app("/tools"));
  await expect(page.getByRole("alert")).toContainText("The data service address is unavailable");
  await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
});

test("missing pages offer working home and resource search routes", async ({ page }, testInfo) => {
  await page.goto(app("/missing/page"));
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Resources" })).toHaveAttribute(
    "href",
    app("/tools"),
  );
  await expect(page.getByLabel("Resource title or IRI")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath("404-page.png"), fullPage: true });
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(page.getByRole("heading", { name: "Amharic DBpedia Chapter" })).toBeVisible();
});

test("resource and RDF preview failures use recovery panels", async ({ page }) => {
  await page.route("**/sparql?**", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto(app("/resource/ዳኛቸው_ወርቁ"));
  await expect(page.getByRole("alert")).toContainText("Resource facts");
  await page.goto(app("/resource-preview?iri=http%3A%2F%2Fam.dbpedia.org%2Fresource%2Ftest"));
  await expect(page.getByRole("alert")).toContainText("RDF preview");
});

test("query retry keeps the editor content and returns to results", async ({ page }) => {
  let status = 504;
  await page.route("**/sparql?**", (route) =>
    route.fulfill({
      status,
      contentType: "application/sparql-results+json",
      body: status === 200 ? empty : "timeout",
    }),
  );
  await page.goto(app("/sparql"));
  const editor = page.getByLabel("SPARQL query", { exact: true });
  const query = "SELECT ?s WHERE { ?s ?p ?o } LIMIT 10";
  await editor.fill(query);
  await page.getByRole("button", { name: "Run query", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("The data service took too long");
  status = 200;
  await page.getByRole("button", { name: "Retry loading" }).click();
  await expect(page.getByRole("status")).toContainText("0 rows returned");
  await expect(editor).toHaveValue(query);
});

test("failed downloads and property examples offer inline recovery without alerts", async ({
  page,
}) => {
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.route("**/sparql?**", (route) => {
    const query = new URL(route.request().url()).searchParams.get("query") ?? "";
    return route.fulfill({
      status: query.startsWith("DESCRIBE") ? 502 : 200,
      contentType: "application/sparql-results+json",
      body: empty,
    });
  });
  await page.goto(app("/resource/ዳኛቸው_ወርቁ"));
  await page.getByRole("button", { name: "Download", exact: true }).first().click();
  await expect(page.getByRole("alert")).toContainText("RDF download");
  await expect(page.getByRole("alert")).toContainText("temporarily unavailable");
  expect(dialogs).toEqual([]);
  await page.unroute("**/sparql?**");
  await page.route("**/sparql?**", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto(app("/property/http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label"));
  await expect(page.getByRole("alert")).toContainText("Property examples");
  await expect(page.getByRole("heading", { name: "label", exact: true })).toBeVisible();
});
