import { chapterMetrics, mappingStatistics, researchHighlights } from "@amdb/content";
import { pickLocalized } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { clear } from "../dom/html";

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

export function renderStatistics(layout: AppLayout): void {
  clear(layout.main);
  const language = layout.getLanguage();
  const section = document.createElement("section");
  section.className = "page-section statistics-page";
  const title = document.createElement("h1");
  title.textContent = "Chapter statistics";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent = "Open a metric to understand what it measures and follow its source.";

  const metrics = document.createElement("div");
  metrics.className = "metric-grid metric-grid--wide";
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
    detail.textContent = "Open definition and source";
    button.append(value, label, detail);
    const insight = metricInsights[index];
    if (insight) button.addEventListener("click", () => openMetricDialog(insight));
    article.append(button);
    metrics.append(article);
  }

  const table = document.createElement("table");
  table.className = "stats-table";
  const headerRow = document.createElement("tr");
  for (const heading of ["Statistic", "Coverage", "Count", "Meaning"]) {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = heading;
    headerRow.append(cell);
  }
  const thead = document.createElement("thead");
  thead.append(headerRow);
  const tbody = document.createElement("tbody");
  for (const statistic of mappingStatistics) {
    const row = document.createElement("tr");
    for (const value of [
      statistic.label,
      statistic.percentage,
      statistic.count,
      statistic.description,
    ]) {
      const cell = document.createElement(value === statistic.label ? "th" : "td");
      if (cell instanceof HTMLTableCellElement && value === statistic.label) cell.scope = "row";
      cell.textContent = value;
      row.append(cell);
    }
    tbody.append(row);
  }
  table.append(thead, tbody);

  const highlights = document.createElement("div");
  highlights.className = "insight-grid";
  const highlightsTitle = document.createElement("h2");
  highlightsTitle.textContent = "Research notes";
  highlights.append(highlightsTitle);
  for (const highlight of researchHighlights) {
    const card = document.createElement("article");
    card.className = "insight-card";
    const cardTitle = document.createElement("h3");
    cardTitle.textContent = pickLocalized(highlight.title, language) ?? "";
    const cardBody = document.createElement("p");
    cardBody.textContent = pickLocalized(highlight.body, language) ?? "";
    card.append(cardTitle, cardBody);
    highlights.append(card);
  }

  section.append(title, intro, metrics, table, highlights);
  layout.main.append(section);
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
