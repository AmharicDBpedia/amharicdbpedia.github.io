import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear, externalLink, faIcon, type IconName } from "../dom/html";

export function renderTools(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section tools-page resources-page";
  const title = document.createElement("h1");
  title.textContent = "Resources";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent =
    "Use the live interfaces, published datasets, mappings, and research paper that make Amharic DBpedia reusable.";

  const tools = document.createElement("section");
  tools.className = "tools-page__section";
  tools.append(sectionHeading("Tools", "Start with the interfaces that let you use the data."));
  const toolGrid = document.createElement("div");
  toolGrid.className = "resource-grid tools-page__grid";
  toolGrid.append(
    internalCard(
      "SPARQL workspace",
      "Write bounded queries against the Amharic graph.",
      "/sparql",
      "code",
    ),
    internalCard(
      "Resource directory",
      "Browse entities and open a resource facts page.",
      "/resource",
      "magnifying-glass",
    ),
    externalCard(
      "Extraction Framework",
      "The upstream framework that turns Wikipedia dumps into RDF.",
      "https://github.com/dbpedia/extraction-framework",
      "code",
    ),
  );
  tools.append(toolGrid);

  const datasets = document.createElement("section");
  datasets.className = "tools-page__section";
  datasets.append(
    sectionHeading("Datasets", "Find the published graph and the mappings that shape it."),
  );
  const datasetGrid = document.createElement("div");
  datasetGrid.className = "resource-grid tools-page__grid";
  datasetGrid.append(
    externalCard(
      "Databus collection",
      "Download the Amharic DBpedia RDF releases and their published artifacts.",
      "https://databus.dbpedia.org/purplebee/collections/am_chapter/",
      "download",
    ),
    externalCard(
      "Amharic mappings",
      "Review and maintain the Amharic template-to-ontology mappings.",
      "https://mappings.dbpedia.org/index.php/Mapping_am",
      "book-open",
    ),
    externalCard(
      "DICE Research dataset",
      "Query the published Amharic DBpedia dataset through the DICE Research endpoint.",
      "https://am.dbpedia.data.dice-research.org/ui",
      "database",
    ),
  );
  datasets.append(datasetGrid);

  const publication = document.createElement("section");
  publication.className = "tools-page__section";
  publication.append(
    sectionHeading(
      "Publication",
      "Read the paper that documents the chapter and its extraction work.",
    ),
  );
  const publicationGrid = document.createElement("div");
  publicationGrid.className = "resource-grid tools-page__grid";
  publicationGrid.append(
    externalCard(
      "The Amharic DBpedia Chapter",
      "The LREC 2026 research paper describing the chapter, graph, and language-aware processing.",
      "https://lrec.elra.info/lrec2026-main-627",
      "book-open",
    ),
  );
  publication.append(publicationGrid);

  section.append(title, intro, tools, datasets, publication);
  layout.main.append(section);
}

function sectionHeading(title: string, description: string): HTMLElement {
  const heading = document.createElement("div");
  heading.className = "section-heading";
  const titleElement = document.createElement("h2");
  titleElement.textContent = title;
  const descriptionElement = document.createElement("p");
  descriptionElement.textContent = description;
  heading.append(titleElement, descriptionElement);
  return heading;
}

function internalCard(
  title: string,
  description: string,
  href: string,
  icon: IconName,
): HTMLElement {
  const card = document.createElement("article");
  card.className = "resource-card resource-card--linked";
  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = appHref(href);
  link.textContent = title;
  heading.append(faIcon(icon), link);
  const body = document.createElement("p");
  body.textContent = description;
  card.append(heading, body);
  return card;
}

function externalCard(
  title: string,
  description: string,
  href: string,
  icon: IconName,
): HTMLElement {
  const card = document.createElement("article");
  card.className = "resource-card resource-card--linked";
  const heading = document.createElement("h3");
  heading.append(faIcon(icon), externalLink(href, title));
  const body = document.createElement("p");
  body.textContent = description;
  card.append(heading, body);
  return card;
}
