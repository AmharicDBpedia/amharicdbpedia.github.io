import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";

export function renderDocs(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section docs-page";
  const title = document.createElement("h1");
  title.textContent = "How to use Amharic DBpedia";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent =
    "A practical map of the website: where to search, query, reuse, and contribute to Amharic DBpedia.";

  const guide = document.createElement("section");
  guide.className = "docs-guide";
  const guideTitle = document.createElement("h2");
  guideTitle.textContent = "Choose your path";
  const guideIntro = document.createElement("p");
  guideIntro.textContent =
    "Start at Home for the chapter snapshot, then follow the path below depending on what you want to do.";
  const guideSteps = document.createElement("div");
  guideSteps.className = "docs-guide__steps";
  const steps = [
    [
      "01",
      "Find an entity",
      "Use Home search or Resources to browse Amharic DBpedia entities and inspect their RDF facts.",
      "/resource",
    ],
    [
      "02",
      "Query the graph",
      "Open SPARQL, start with an example, and run bounded queries against the public endpoint.",
      "/sparql",
    ],
    [
      "03",
      "Reuse the release",
      "Use Resources for the paper, DICE Research endpoint, Databus, mappings wiki, and extraction framework.",
      "/tools",
    ],
    [
      "04",
      "Contribute",
      "Read the contributor guide and architecture notes before changing mappings, extraction behavior, or routes.",
      "https://github.com/AmharicDBpedia/AmharicDBpediaChapter/blob/main/CONTRIBUTING.md",
    ],
  ] as const;
  for (const [number, headingText, bodyText, href] of steps) {
    const step = document.createElement("article");
    step.className = "docs-guide__step";
    const numberElement = document.createElement("span");
    numberElement.className = "docs-guide__number";
    numberElement.textContent = number;
    const heading = document.createElement("h3");
    heading.textContent = headingText;
    const body = document.createElement("p");
    body.textContent = bodyText;
    const link = document.createElement("a");
    link.href = href.startsWith("/") ? appHref(href) : href;
    if (!href.startsWith("/")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    link.textContent = `Open ${headingText}`;
    step.append(numberElement, heading, body, link);
    guideSteps.append(step);
  }
  guide.append(guideTitle, guideIntro, guideSteps);

  const examples = document.createElement("section");
  examples.className = "docs-examples";
  const examplesTitle = document.createElement("h2");
  examplesTitle.textContent = "Three useful first steps";
  const examplesGrid = document.createElement("div");
  examplesGrid.className = "docs-examples__grid";
  const examplesData = [
    [
      "Search",
      "Type an Amharic title or full resource IRI into Home search. Open a result to see labels, links, and predicates.",
    ],
    [
      "Query",
      "In SPARQL, begin with SELECT ?s WHERE { ?s ?p ?o } LIMIT 10. Keep a LIMIT while exploring, then add a resource or predicate filter.",
    ],
    [
      "Read RDF",
      "Read a triple as subject → predicate → object. A property page explains what the predicate means and shows how it is used in this graph.",
    ],
  ] as const;
  for (const [titleText, bodyText] of examplesData) {
    const card = document.createElement("article");
    card.className = "docs-example";
    const cardTitle = document.createElement("h3");
    cardTitle.textContent = titleText;
    const cardBody = document.createElement("p");
    cardBody.textContent = bodyText;
    card.append(cardTitle, cardBody);
    examplesGrid.append(card);
  }
  examples.append(examplesTitle, examplesGrid);

  const references = document.createElement("section");
  references.className = "docs-references";
  const referencesTitle = document.createElement("h2");
  referencesTitle.textContent = "Reference shelf";
  const referencesIntro = document.createElement("p");
  referencesIntro.textContent =
    "Use these sources for the full project context or when you want to contribute.";
  const referencesGrid = document.createElement("div");
  referencesGrid.className = "docs-references__grid";
  const referenceItems = [
    [
      "Amharic DBpedia wiki",
      "Project decisions, chapter notes, and collaborative working material.",
      "https://github.com/AmharicDBpedia/AmharicDBpediaChapter/wiki",
    ],
    [
      "Contributor guide on GitHub",
      "Open the chapter repository and its contribution material on GitHub.",
      "https://github.com/AmharicDBpedia/AmharicDBpediaChapter/blob/main/CONTRIBUTING.md",
    ],
  ] as const;
  for (const [name, description, href] of referenceItems) {
    const card = document.createElement("article");
    card.className = "docs-reference";
    const heading = document.createElement("h3");
    const link = document.createElement("a");
    link.href = href.startsWith("/") ? appHref(href) : href;
    if (!href.startsWith("/")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    link.textContent = name;
    heading.append(link);
    const body = document.createElement("p");
    body.textContent = description;
    card.append(heading, body);
    referencesGrid.append(card);
  }
  references.append(referencesTitle, referencesIntro, referencesGrid);

  section.append(title, intro, guide, examples, references);
  layout.main.append(section);
}
