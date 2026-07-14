import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";

const documents = [
  [
    "Contributor guide",
    "How to contribute mappings, code, and documentation.",
    "/docs/contributor-guide.md",
  ],
  [
    "Architecture",
    "The frontend, backend, extraction, and retrieval boundaries.",
    "/docs/architecture.md",
  ],
  [
    "RDF pipeline",
    "How Wikipedia input becomes Amharic DBpedia RDF output.",
    "/docs/rdf-pipeline.md",
  ],
  [
    "Frontend implementation",
    "The route, component, and styling conventions used by the site.",
    "/docs/frontend-implementation.md",
  ],
  [
    "Backend API demo guide",
    "A practical walkthrough of the statistics and mapping APIs.",
    "/docs/backend-api-demo-guide.md",
  ],
] as const;

export function renderDocs(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section docs-page";
  const title = document.createElement("h1");
  title.textContent = "Documentation";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent = "Guides for understanding, using, and contributing to Amharic DBpedia.";

  const list = document.createElement("div");
  list.className = "doc-list";
  for (const [name, description, href] of documents) {
    const article = document.createElement("article");
    article.className = "doc-list__item";
    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = appHref(href);
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = name;
    heading.append(link);
    const body = document.createElement("p");
    body.textContent = description;
    article.append(heading, body);
    list.append(article);
  }

  section.append(title, intro, list);
  layout.main.append(section);
}
