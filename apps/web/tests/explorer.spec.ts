import { expect, type Page, test } from "@playwright/test";

const base = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5174/");
const toolsPath = `${base.pathname.replace(/\/$/, "")}/tools`;
const binding = (index: number) => ({
  subject: { type: "uri", value: `http://am.dbpedia.org/resource/ዳኛቸው_ወርቁ_${index}` },
  predicate: { type: "uri", value: "http://dbpedia.org/ontology/birthPlace" },
  object: { type: "uri", value: `http://am.dbpedia.org/resource/ደብረ_ብርሃን_${index}` },
});
const response = (bindings: unknown[]) =>
  JSON.stringify({ head: { vars: ["subject", "predicate", "object"] }, results: { bindings } });

async function mockPages(page: Page) {
  await page.route("**/sparql?**", (route) => {
    const query = new URL(route.request().url()).searchParams.get("query") ?? "";
    const second = query.includes("OFFSET 1000");
    return route.fulfill({
      contentType: "application/sparql-results+json",
      body: response(
        Array.from({ length: second ? 3 : 1001 }, (_, i) => binding(i + (second ? 1000 : 0))),
      ),
    });
  });
}

test("virtualizes a thousand facts, pages, and supports keyboard inspection", async ({
  page,
}, testInfo) => {
  await mockPages(page);
  await page.goto(toolsPath);
  await expect(page.locator(".atlas-count")).toHaveText("2,000 resources · 1,000 connections");
  const rows = page.locator(".atlas-facts__row");
  expect(await rows.count()).toBeLessThan(30);
  expect(await rows.count()).toBeGreaterThan(0);
  const viewport = page.getByRole("table", { name: "RDF facts in this page" });
  await viewport.evaluate((element) => {
    element.scrollTop = 26000;
  });
  await expect(rows.first()).toHaveAttribute("aria-rowindex", /49[0-9]/);
  expect(await rows.count()).toBeLessThan(30);
  await page.locator(".atlas-network").focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page
      .getByRole("complementary", { name: "Selected resource" })
      .getByRole("link", { name: "Open full resource" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Reset view" }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("resources-explorer.png"), fullPage: true });
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.locator(".atlas-status")).toContainText("Facts 1,001–1,003");
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  await expect(viewport).toHaveAttribute("aria-rowcount", "4");
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page.locator(".atlas-status")).toContainText("Facts 1–1,000");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("selects a map point by pointer and scopes the next query to its resource", async ({
  page,
}) => {
  const queries: string[] = [];
  await page.route("**/sparql?**", (route) => {
    queries.push(new URL(route.request().url()).searchParams.get("query") ?? "");
    return route.fulfill({
      contentType: "application/sparql-results+json",
      body: response([binding(0)]),
    });
  });
  await page.goto(toolsPath);
  await expect(page.locator(".atlas-count")).toContainText("2 resources");
  const canvas = page.locator(".atlas-network");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas is missing");
  await canvas.click({ position: { x: box.width / 2, y: box.height / 2 } });
  await expect(page.locator(".atlas-inspector h3")).toHaveText("ዳኛቸው ወርቁ 0");
  await page.getByRole("button", { name: "Explore this resource" }).click();
  await expect
    .poll(() => queries.at(-1))
    .toContain("VALUES ?subject { <http://am.dbpedia.org/resource/ዳኛቸው_ወርቁ_0> }");
});

test("recovers from endpoint errors and renders an explicit empty state", async ({ page }) => {
  let fail = true;
  await page.route("**/sparql?**", (route) =>
    route.fulfill({
      status: fail ? 502 : 200,
      contentType: "application/sparql-results+json",
      body: fail ? "Bad Gateway" : response([]),
    }),
  );
  await page.goto(toolsPath);
  await expect(page.locator(".atlas-status")).toContainText("Could not load facts");
  fail = false;
  await page.getByRole("button", { name: "Retry loading" }).click();
  await expect(page.locator(".atlas-status")).toContainText("No facts found");
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
});

test("does not let an older search overwrite newer results or a different route", async ({
  page,
}) => {
  let release: (() => void) | undefined;
  await page.route("**/sparql?**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("query") ?? "";
    if (!query.includes("VALUES"))
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    await route
      .fulfill({
        contentType: "application/sparql-results+json",
        body: response(query.includes("VALUES") ? [binding(0)] : [binding(1), binding(2)]),
      })
      .catch(() => {});
  });
  await page.goto(toolsPath);
  await expect.poll(() => !!release).toBe(true);
  await page.getByLabel("Explore a resource", { exact: true }).fill("ዳኛቸው ወርቁ");
  await page.getByRole("button", { name: "Explore connections" }).click();
  await expect(page.locator(".atlas-count")).toContainText("2 resources");
  release?.();
  await page.getByRole("link", { name: "Resource directory", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Resource explorer" })).toBeVisible();
  await expect(page.locator(".atlas")).toHaveCount(0);
});
