import { chapterMetrics, newsItems, researchHighlights, resourceLinks } from "@amdb/content";
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
  const statsLink = document.createElement("a");
  statsLink.className = "button-link";
  statsLink.href = appHref("/#statistics");
  statsLink.textContent = "See chapter stats";
  heroActions.append(sparqlLink, statsLink);
  copy.append(eyebrow, title, body, renderResourceSearch(layout), heroActions);

  const visual = document.createElement("div");
  visual.className = "hero__visual";
  const visualTitle = document.createElement("strong");
  visualTitle.textContent = "አማርኛ DBpedia";
  const visualBody = document.createElement("p");
  visualBody.textContent =
    "Wikipedia dumps + mappings + Amharic-aware parsers -> RDF knowledge graph";
  const visualFooter = document.createElement("span");
  visualFooter.textContent = "528,370 unique triples";
  visual.append(visualTitle, visualBody, visualFooter);

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
  const progress = [97, 77.29, 99.15, 100];
  for (const [index, metric] of chapterMetrics.entries()) {
    const article = document.createElement("article");
    article.className = `metric metric--${metric.tone ?? "primary"}`;
    const value = document.createElement("strong");
    value.textContent = metric.value;
    const label = document.createElement("span");
    label.textContent = pickLocalized(metric.label, language) ?? "";
    const detail = document.createElement("p");
    detail.textContent = pickLocalized(metric.detail, language) ?? "";
    const meter = document.createElement("div");
    meter.className = "metric__meter";
    meter.setAttribute("role", "progressbar");
    meter.setAttribute("aria-label", `${metric.label.en} baseline`);
    meter.setAttribute("aria-valuemin", "0");
    meter.setAttribute("aria-valuemax", "100");
    meter.setAttribute("aria-valuenow", String(progress[index] ?? 0));
    const fill = document.createElement("span");
    fill.className = "metric__meter-fill";
    fill.style.width = `${progress[index] ?? 0}%`;
    meter.append(fill);
    article.append(value, label, meter, detail);
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
