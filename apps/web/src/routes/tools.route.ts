import { datasetArtifacts, resourceLinks } from "@amdb/content";
import { AMHARIC_DATABUS_COLLECTION } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear, externalLink } from "../dom/html";

export function renderTools(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section tools-page";
  const title = document.createElement("h1");
  title.textContent = "Tools & publications";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent =
    "Query the graph, browse its resources, and find the published releases that make Amharic DBpedia reusable.";

  const tools = document.createElement("section");
  tools.className = "tools-page__section";
  tools.append(sectionHeading("Tools", "Start with the live interfaces."));
  const toolGrid = document.createElement("div");
  toolGrid.className = "resource-grid tools-page__grid";
  toolGrid.append(
    internalCard("SPARQL workspace", "Write bounded queries against the Amharic graph.", "/sparql"),
    internalCard(
      "Resource directory",
      "Browse entities and open a resource facts page.",
      "/resource",
    ),
  );
  tools.append(toolGrid);

  const publications = document.createElement("section");
  publications.className = "tools-page__section";
  publications.append(
    sectionHeading(
      "Publications & releases",
      "Research updates, mappings, and downloadable artifacts.",
    ),
  );
  const publicationGrid = document.createElement("div");
  publicationGrid.className = "resource-grid tools-page__grid";
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
    cardTitle.append(externalLink(link.href, link.title.en));
    const description = document.createElement("p");
    description.textContent = link.description.en;
    card.append(cardTitle, description);
    publicationGrid.append(card);
  }
  publications.append(
    publicationGrid,
    externalLink(AMHARIC_DATABUS_COLLECTION, "Open the Amharic Databus collection"),
  );

  const artifacts = document.createElement("section");
  artifacts.className = "tools-page__section";
  artifacts.append(
    sectionHeading("Release contents", "The artifact families published for reuse."),
  );
  const list = document.createElement("ul");
  list.className = "dataset-list";
  for (const artifact of datasetArtifacts) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = artifact.name;
    const badge = document.createElement("span");
    badge.className = `dataset-badge dataset-badge--${artifact.type}`;
    badge.textContent = artifact.type;
    const description = document.createElement("p");
    description.textContent = artifact.description;
    item.append(name, badge, description);
    list.append(item);
  }
  artifacts.append(list);

  section.append(title, intro, tools, publications, artifacts);
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

function internalCard(title: string, description: string, href: string): HTMLElement {
  const card = document.createElement("article");
  card.className = "resource-card resource-card--linked";
  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = appHref(href);
  link.textContent = title;
  heading.append(link);
  const body = document.createElement("p");
  body.textContent = description;
  card.append(heading, body);
  return card;
}
