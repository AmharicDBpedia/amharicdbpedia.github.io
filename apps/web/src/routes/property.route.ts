import { compactIri, describePredicate, type Iri, toIri } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { renderRdfTerm } from "../components/property-table";
import { clear, externalLink } from "../dom/html";
import { loadPredicateUsage, type PredicateUsage } from "../services/property.service";

let activeController: AbortController | undefined;

export async function renderProperty(layout: AppLayout, iriParam: string): Promise<void> {
  activeController?.abort();
  activeController = new AbortController();

  clear(layout.main);
  const section = document.createElement("section");
  section.className = "page-section property-page";
  layout.main.append(section);

  let iri: Iri;
  try {
    iri = toIri(decodeURIComponentSafe(iriParam));
  } catch {
    renderInvalidProperty(section, iriParam);
    return;
  }

  const description = describePredicate(iri);
  section.append(
    renderHeader(description),
    renderReadingGuide(description),
    renderFlow(description),
    renderStatementTable(description),
  );

  const usagePanel = renderUsageLoading();
  section.append(usagePanel);

  try {
    const usage = await loadPredicateUsage(iri, activeController.signal);
    usagePanel.replaceWith(renderUsage(usage));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    usagePanel.replaceWith(renderUsageError(error));
  }
}

function renderHeader(description: ReturnType<typeof describePredicate>): HTMLElement {
  const header = document.createElement("header");
  header.className = "property-header";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = description.rdfRole;

  const title = document.createElement("h1");
  title.textContent = description.label;

  const summary = document.createElement("p");
  summary.className = "lead";
  summary.textContent = description.description;

  const iri = document.createElement("p");
  iri.className = "resource-iri";
  iri.append(externalLink(description.iri, description.iri));

  const cards = document.createElement("div");
  cards.className = "property-summary-grid";
  for (const [label, value] of [
    ["Compact IRI", description.compactLabel],
    ["Namespace", description.namespaceLabel],
    ["Value shape", description.expectedValue],
  ] as const) {
    const card = document.createElement("article");
    card.className = "property-summary-card";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    card.append(strong, span);
    cards.append(card);
  }

  const actions = document.createElement("div");
  actions.className = "property-actions";
  actions.append(externalLink(description.iri, "Canonical IRI"));
  if (description.externalPage)
    actions.append(externalLink(description.externalPage, "DBpedia page"));
  if (description.isDefinedBy) actions.append(externalLink(description.isDefinedBy, "Vocabulary"));

  header.append(eyebrow, title, summary, iri, cards, actions);
  return header;
}

function renderStatementTable(description: ReturnType<typeof describePredicate>): HTMLElement {
  const section = document.createElement("section");
  section.className = "property-panel";
  const title = document.createElement("h2");
  title.textContent = "Property statements";
  const intro = document.createElement("p");
  intro.textContent =
    "These statements are the vocabulary facts about the property itself. They describe the property label, type, defining vocabulary, domain, and range.";

  const table = document.createElement("table");
  table.className = "property-table";
  const tbody = document.createElement("tbody");
  for (const [property, value] of propertyRows(description)) {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = property;
    const td = document.createElement("td");
    td.textContent = value;
    row.append(th, td);
    tbody.append(row);
  }
  table.append(tbody);
  section.append(title, intro, table);
  return section;
}

function propertyRows(
  description: ReturnType<typeof describePredicate>,
): readonly (readonly [string, string])[] {
  return [
    ["rdf:type", description.typeLabels.join(", ")],
    ["rdfs:label", description.label],
    ["rdfs:comment", description.description],
    ["rdfs:isDefinedBy", description.namespaceIri],
    ...(description.domain ? ([["rdfs:domain", description.domain]] as const) : []),
    ...(description.range ? ([["rdfs:range", description.range]] as const) : []),
  ];
}

function renderReadingGuide(description: ReturnType<typeof describePredicate>): HTMLElement {
  const section = document.createElement("section");
  section.className = "property-panel property-guide";
  const title = document.createElement("h2");
  title.textContent = "Read this as RDF";

  const intro = document.createElement("p");
  intro.textContent =
    "A resource table row is one RDF triple. The resource page supplies the subject, this property is the predicate, and the value column is the object.";

  const meaning = document.createElement("p");
  meaning.className = "property-guide__meaning";
  meaning.textContent = description.plainMeaning;

  const value = document.createElement("p");
  value.textContent = description.valueExplanation;

  section.append(title, intro, meaning, value);
  return section;
}

function renderFlow(description: ReturnType<typeof describePredicate>): HTMLElement {
  const section = document.createElement("section");
  section.className = "property-panel";
  const title = document.createElement("h2");
  title.textContent = "Triple pattern";
  const intro = document.createElement("p");
  intro.textContent =
    "When this property appears in Amharic DBpedia, read the triple from left to right.";

  const flow = document.createElement("div");
  flow.className = "triple-flow";
  for (const [label, value] of [
    ["Subject", "?resource"],
    ["Predicate", description.compactLabel],
    ["Object", description.exampleObject],
  ] as const) {
    const item = document.createElement("article");
    const strong = document.createElement("strong");
    strong.textContent = label;
    const code = document.createElement("code");
    code.textContent = value;
    item.append(strong, code);
    flow.append(item);
  }

  section.append(title, intro, flow);
  return section;
}

function renderUsageLoading(): HTMLElement {
  const section = document.createElement("section");
  section.className = "property-panel";
  const title = document.createElement("h2");
  title.textContent = "Usage in Amharic DBpedia";
  const status = document.createElement("p");
  status.className = "status";
  status.textContent = "Loading examples from the SPARQL endpoint...";
  section.append(title, status);
  return section;
}

function renderUsage(usage: readonly PredicateUsage[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "property-panel";
  const title = document.createElement("h2");
  title.textContent = "Usage in Amharic DBpedia";
  const intro = document.createElement("p");
  intro.textContent =
    "These rows show real triples that use this predicate. The subject column is the resource being described; the object column is the value attached by this property.";
  section.append(title, intro);

  if (usage.length === 0) {
    const empty = document.createElement("p");
    empty.className = "status";
    empty.textContent = "No examples were returned for this predicate.";
    section.append(empty);
    return section;
  }

  const table = document.createElement("table");
  table.className = "property-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const heading of ["Subject", "Object"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = heading;
    headRow.append(th);
  }
  thead.append(headRow);

  const tbody = document.createElement("tbody");
  for (const example of usage) {
    const row = document.createElement("tr");
    const subject = document.createElement("th");
    subject.scope = "row";
    const link = document.createElement("a");
    link.href = appHref(`/resource/${encodeURIComponent(example.subject)}`);
    link.textContent = compactIri(example.subject) || example.subjectLabel;
    subject.append(link);

    const object = document.createElement("td");
    object.append(renderRdfTerm(example.object));
    row.append(subject, object);
    tbody.append(row);
  }

  table.append(thead, tbody);
  section.append(table);
  return section;
}

function renderUsageError(error: unknown): HTMLElement {
  const section = document.createElement("section");
  section.className = "property-panel";
  const title = document.createElement("h2");
  title.textContent = "Usage in Amharic DBpedia";
  const status = document.createElement("p");
  status.className = "status status--error";
  status.textContent = error instanceof Error ? error.message : "Failed to load predicate examples";
  section.append(title, status);
  return section;
}

function renderInvalidProperty(section: HTMLElement, value: string): void {
  const title = document.createElement("h1");
  title.textContent = "Property not found";
  const body = document.createElement("p");
  body.className = "lead";
  body.textContent = `The route parameter is not an absolute IRI: ${value}`;
  section.append(title, body);
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
