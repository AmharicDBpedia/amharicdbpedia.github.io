import { newsItems, resourceLinks } from "@amdb/content";
import { pickLocalized } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { renderNewsItem } from "../components/news-item";
import { clear, externalLink } from "../dom/html";
import { renderResourceSearch } from "../features/search/resource-search";

export function renderHome(layout: AppLayout): void {
  clear(layout.main);
  const language = layout.getLanguage();

  const hero = document.createElement("section");
  hero.className = "hero";

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

  const visual = document.createElement("div");
  visual.className = "hero__visual hero__visual--graph";
  const graph = document.createElement("div");
  graph.className = "graph-map";
  for (const edge of [
    "graph-map__edge--one",
    "graph-map__edge--two",
    "graph-map__edge--three",
    "graph-map__edge--four",
  ]) {
    const edgeElement = document.createElement("span");
    edgeElement.className = `graph-map__edge ${edge}`;
    graph.append(edgeElement);
  }
  for (const [index, node] of [
    "Amharic",
    "RDF",
    "Ethiopia",
    "DBpedia",
    "Wiki",
    "SPARQL",
  ].entries()) {
    const nodeElement = document.createElement("span");
    nodeElement.className = `graph-map__node graph-map__node--${index + 1}`;
    nodeElement.textContent = node;
    graph.append(nodeElement);
  }
  const visualTitle = document.createElement("strong");
  visualTitle.textContent = "Amharic Dbpedia";
  const visualBody = document.createElement("p");
  visualBody.textContent =
    "Wikipedia dumps + mappings + Amharic-aware parsers -> RDF knowledge graph";
  visual.append(graph, visualTitle, visualBody);

  hero.append(copy, visual);

  const quickStart = document.createElement("section");
  quickStart.className = "home-quick-start";
  const quickStartHeading = document.createElement("div");
  quickStartHeading.className = "section-heading";
  const quickStartTitle = document.createElement("h2");
  quickStartTitle.textContent = "Start with a question";
  const quickStartIntro = document.createElement("p");
  quickStartIntro.textContent =
    "Choose the shortest path to the part of Amharic DBpedia you want to explore.";
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

  const news = document.createElement("section");
  news.className = "news-section";
  news.id = "news";
  const newsHeader = document.createElement("div");
  newsHeader.className = "section-heading";
  const newsCopy = document.createElement("div");
  const newsEyebrow = document.createElement("p");
  newsEyebrow.className = "eyebrow";
  newsEyebrow.textContent = "Chapter updates";
  const newsHeading = document.createElement("h2");
  newsHeading.textContent = "Latest news";
  newsCopy.append(newsEyebrow, newsHeading);
  const newsArchive = document.createElement("a");
  newsArchive.className = "button-link";
  newsArchive.href = appHref("/news");
  newsArchive.textContent = "View all news";
  newsHeader.append(newsCopy, newsArchive);

  const newsGrid = document.createElement("div");
  newsGrid.className = "news-grid";
  for (const item of newsItems.slice(0, 3)) {
    newsGrid.append(renderNewsItem(item, language));
  }
  news.append(newsHeader, newsGrid);

  const resources = document.createElement("section");
  resources.className = "resource-grid";
  const heading = document.createElement("h2");
  heading.textContent = "DBpedia chapter entry points";
  resources.append(heading);
  for (const link of resourceLinks) {
    const card = document.createElement("article");
    card.className = "resource-card";
    if (link.image) {
      const image = document.createElement("img");
      image.src = appHref(link.image);
      image.alt = "";
      image.loading = "lazy";
      card.append(image);
    }
    const cardTitle = document.createElement("h3");
    cardTitle.append(externalLink(link.href, pickLocalized(link.title, language) ?? ""));
    const description = document.createElement("p");
    description.textContent = pickLocalized(link.description, language) ?? "";
    card.append(cardTitle, description);
    resources.append(card);
  }

  layout.main.append(hero, quickStart, news, resources);
}
