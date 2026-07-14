import { chapterMetrics, newsItems, researchHighlights, resourceLinks } from "@amdb/content";
import { pickLocalized } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { renderNewsItem } from "../components/news-item";
import { clear, externalLink } from "../dom/html";
import { renderResourceSearch } from "../features/search/resource-search";

interface MetricInsight {
  readonly title: string;
  readonly body: string;
  readonly sourceLabel: string;
  readonly sourceHref: string;
}

const metricInsights: readonly MetricInsight[] = [
  {
    title: "Mapped templates",
    body: "A mapped template connects an Amharic Wikipedia infobox to DBpedia's shared ontology, turning recurring fields into structured RDF.",
    sourceLabel: "Open Amharic mappings",
    sourceHref: "https://mappings.dbpedia.org/index.php/Mapping_am",
  },
  {
    title: "Property coverage",
    body: "Property coverage measures how many distinct infobox fields were matched to DBpedia ontology properties.",
    sourceLabel: "Open ontology example",
    sourceHref: "https://mappings.dbpedia.org/index.php/OntologyClass%3APerson",
  },
  {
    title: "Property occurrences",
    body: "Occurrences count real uses of mapped fields across Amharic Wikipedia pages, showing how much published article data is covered.",
    sourceLabel: "Open Amharic mappings",
    sourceHref: "https://mappings.dbpedia.org/index.php/Mapping_am",
  },
  {
    title: "Unique triples",
    body: "A triple is one structured fact: subject, predicate, and object. Unique triples are the deduplicated facts in the release.",
    sourceLabel: "Open Databus collection",
    sourceHref: "https://databus.dbpedia.org/purplebee/collections/am_chapter/",
  },
];

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
  const statsLink = document.createElement("a");
  statsLink.className = "button-link";
  statsLink.href = appHref("/#statistics");
  statsLink.textContent = "See chapter stats";
  heroActions.append(sparqlLink, statsLink);
  copy.append(eyebrow, title, body, renderResourceSearch(layout), heroActions);

  const visual = document.createElement("div");
  visual.className = "hero__visual hero__visual--graph";
  const graph = document.createElement("div");
  graph.className = "graph-map";
  for (const node of ["አማርኛ", "RDF", "OWL", "DBpedia", "Wiki", "SPARQL"]) {
    const nodeElement = document.createElement("span");
    nodeElement.className = "graph-map__node";
    nodeElement.textContent = node;
    graph.append(nodeElement);
  }
  const visualTitle = document.createElement("strong");
  visualTitle.textContent = "አማርኛ DBpedia";
  const visualBody = document.createElement("p");
  visualBody.textContent =
    "Wikipedia dumps + mappings + Amharic-aware parsers -> RDF knowledge graph";
  const visualFooter = document.createElement("span");
  visualFooter.textContent = "528,370 unique triples";
  visual.append(graph, visualTitle, visualBody, visualFooter);

  hero.append(copy, visual);

  const statistics = document.createElement("section");
  statistics.className = "home-statistics";
  statistics.id = "statistics";
  const statisticsHeader = document.createElement("div");
  statisticsHeader.className = "home-statistics__header";
  const statisticsTitle = document.createElement("h2");
  statisticsTitle.textContent = "Chapter at a glance";
  const statisticsIntro = document.createElement("p");
  statisticsIntro.textContent =
    "A compact view of the current Amharic DBpedia release. Each number points to a different layer of the graph.";
  statisticsHeader.append(statisticsTitle, statisticsIntro);
  const metrics = document.createElement("div");
  metrics.className = "metric-grid";
  for (const [index, metric] of chapterMetrics.entries()) {
    const article = document.createElement("article");
    article.className = `metric metric--${metric.tone ?? "primary"} metric--interactive`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "metric__button";
    const value = document.createElement("strong");
    value.textContent = metric.value;
    const label = document.createElement("span");
    label.textContent = pickLocalized(metric.label, language) ?? "";
    const detail = document.createElement("p");
    detail.textContent = pickLocalized(metric.detail, language) ?? "";
    button.append(value, label, detail);
    const insight = metricInsights[index];
    if (insight) button.addEventListener("click", () => openMetricDialog(insight));
    article.append(button);
    metrics.append(article);
  }
  statistics.append(statisticsHeader, metrics);

  const research = document.createElement("section");
  research.className = "insight-grid";
  const researchHeading = document.createElement("h2");
  researchHeading.textContent = "What makes this chapter different";
  research.append(researchHeading);
  for (const highlight of researchHighlights) {
    const article = document.createElement("article");
    article.className = "insight-card";
    const itemTitle = document.createElement("h3");
    itemTitle.textContent = pickLocalized(highlight.title, language) ?? "";
    const itemBody = document.createElement("p");
    itemBody.textContent = pickLocalized(highlight.body, language) ?? "";
    article.append(itemTitle, itemBody);
    research.append(article);
  }

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

  layout.main.append(hero, statistics, research, news, resources);
}

function openMetricDialog(insight: MetricInsight): void {
  document.querySelector("dialog.metric-dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "metric-dialog";
  dialog.ariaLabel = insight.title;
  const title = document.createElement("h2");
  title.textContent = insight.title;
  const body = document.createElement("p");
  body.textContent = insight.body;
  const actions = document.createElement("div");
  actions.className = "metric-dialog__actions";
  const source = document.createElement("a");
  source.className = "button-link button-link--primary";
  source.href = insight.sourceHref;
  source.target = "_blank";
  source.rel = "noreferrer";
  source.textContent = insight.sourceLabel;
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "Close";
  close.addEventListener("click", () => dialog.close());
  actions.append(source, close);
  dialog.append(title, body, actions);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.body.append(dialog);
  dialog.showModal();
}
