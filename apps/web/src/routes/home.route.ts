import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";
import { renderResourceSearch } from "../features/search/resource-search";

export function renderHome(layout: AppLayout): void {
  clear(layout.main);
  const page = document.createElement("div");
  page.className = "home-page";

  const hero = document.createElement("section");
  hero.className = "hero home-hero";

  const copy = document.createElement("div");
  copy.className = "hero__copy";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Live chapter for low-resource linked data";
  const title = document.createElement("h1");
  title.textContent = "Amharic DBpedia Chapter";
  const body = document.createElement("p");
  body.textContent =
    "Explore Amharic Wikipedia as structured RDF: search resources, run bounded SPARQL queries, review mapping coverage, and follow the DBpedia extraction workflow.";
  const heroActions = document.createElement("div");
  heroActions.className = "hero-actions";
  const sparqlLink = document.createElement("a");
  sparqlLink.className = "button-link button-link--primary";
  sparqlLink.href = appHref("/sparql");
  sparqlLink.textContent = "Open SPARQL";
  const resourcesLink = document.createElement("a");
  resourcesLink.className = "button-link";
  resourcesLink.href = appHref("/tools");
  resourcesLink.textContent = "Browse resources";
  heroActions.append(sparqlLink, resourcesLink);
  copy.append(eyebrow, title, body, renderResourceSearch(layout), heroActions);

  hero.append(copy);

  const quickStart = document.createElement("section");
  quickStart.className = "home-quick-start";
  const quickStartHeading = document.createElement("div");
  quickStartHeading.className = "section-heading";
  const quickStartTitle = document.createElement("h2");
  quickStartTitle.textContent = "Start with a question";
  const quickStartIntro = document.createElement("p");
  quickStartIntro.textContent =
    "Choose the path to the part of Amharic DBpedia you want to explore.";
  quickStartHeading.append(quickStartTitle, quickStartIntro);
  const quickStartGrid = document.createElement("div");
  quickStartGrid.className = "home-quick-start__grid";
  for (const item of [
    [
      "Find an entity",
      "Open an Amharic resource and inspect its facts and relationships.",
      "/resource",
    ],
    [
      "Query the graph",
      "Run a bounded SPARQL query against the public knowledge graph.",
      "/sparql",
    ],
    [
      "Reuse the release",
      "Find datasets, mappings, the DICE endpoint, and the research paper.",
      "/tools",
    ],
  ] as const) {
    const card = document.createElement("article");
    card.className = "home-quick-start__card";
    const heading = document.createElement("h3");
    const link = document.createElement("a");
    link.href = appHref(item[2]);
    link.textContent = item[0];
    heading.append(link);
    const body = document.createElement("p");
    body.textContent = item[1];
    card.append(heading, body);
    quickStartGrid.append(card);
  }
  quickStart.append(quickStartHeading, quickStartGrid);

  page.append(renderHomeAmbient(), hero, quickStart);
  layout.main.append(page);
}

function renderHomeAmbient(): HTMLElement {
  const ambient = document.createElement("div");
  ambient.className = "home-ambient";
  ambient.setAttribute("aria-hidden", "true");
  for (let index = 1; index <= 5; index += 1) {
    const line = document.createElement("span");
    line.className = `home-flow-line home-flow-line--${index}`;
    ambient.append(line);
  }
  for (let index = 1; index <= 3; index += 1) {
    const node = document.createElement("span");
    node.className = `home-flow-node home-flow-node--${index}`;
    ambient.append(node);
  }
  return ambient;
}
