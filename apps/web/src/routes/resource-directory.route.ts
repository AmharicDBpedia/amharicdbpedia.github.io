import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";
import { renderResourceSearch } from "../features/search/resource-search";

const examples = ["አዲስ_አበባ", "ደብረ_ብርሃን", "ኢትዮጵያ", "ፓውል_ሃርዲንግ", "ዳኛቸው ወርቁ", "ማርክሲዝም"];

export function renderResourceDirectory(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section resource-directory";
  const title = document.createElement("h1");
  title.textContent = "Resource explorer";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent =
    "Search for an Amharic DBpedia resource by title or full IRI, then inspect its facts, graph neighborhood, and raw RDF.";

  const examplesSection = document.createElement("section");
  examplesSection.className = "resource-directory__examples";
  const examplesTitle = document.createElement("h2");
  examplesTitle.textContent = "Example resources";
  const list = document.createElement("div");
  list.className = "resource-directory__links";
  for (const example of examples) {
    const link = document.createElement("a");
    link.className = "button-link";
    link.href = appHref(`/resource/${encodeURIComponent(example)}`);
    link.textContent = example.replaceAll("_", " ");
    list.append(link);
  }
  examplesSection.append(examplesTitle, list);

  section.append(title, intro, renderResourceSearch(layout), examplesSection);
  layout.main.append(section);
}
