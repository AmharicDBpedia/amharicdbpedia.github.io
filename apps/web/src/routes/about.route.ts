import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";

export function renderAbout(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section about-page";

  const title = document.createElement("h1");
  title.textContent = "About Amharic DBpedia";

  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent =
    "Amharic DBpedia turns knowledge from Amharic Wikipedia into structured facts that people and software can search, connect, and reuse.";

  const overview = document.createElement("section");
  overview.className = "about-panel";
  const overviewTitle = document.createElement("h2");
  overviewTitle.textContent = "The idea in plain language";
  const overviewCopy = document.createElement("p");
  overviewCopy.textContent =
    "A normal Wikipedia article is written for people to read. That is useful, but computers cannot easily tell which words are a person's name, a birthplace, a date, a city, or a link to another topic. DBpedia reads the structured parts of Wikipedia pages and converts them into clear facts such as 'Addis Ababa is a city' or 'this person was born in this place'.";
  overview.append(overviewTitle, overviewCopy);

  const why = document.createElement("section");
  why.className = "about-panel";
  const whyTitle = document.createElement("h2");
  whyTitle.textContent = "Why Amharic needs its own chapter";
  const whyCopy = document.createElement("p");
  whyCopy.textContent =
    "Amharic uses its own script, local names, Ethiopian dates, and article patterns that general English-focused tools do not always understand. The Amharic DBpedia Chapter adapts the DBpedia workflow so Amharic knowledge can be represented accurately instead of being left out of linked data systems.";
  why.append(whyTitle, whyCopy);

  const steps = document.createElement("section");
  steps.className = "about-steps";
  const stepsTitle = document.createElement("h2");
  stepsTitle.textContent = "How the knowledge graph is made";
  const list = document.createElement("ol");
  const items = [
    "Start with Amharic Wikipedia pages and their structured infoboxes.",
    "Match Amharic template fields to DBpedia meanings, such as place, person, date, or organization.",
    "Run extraction tools that turn those fields into RDF triples: small subject-predicate-object facts.",
    "Publish the resulting datasets so researchers, builders, and language communities can query and reuse them.",
  ];
  for (const item of items) {
    const entry = document.createElement("li");
    entry.textContent = item;
    list.append(entry);
  }
  steps.append(stepsTitle, list);

  const uses = document.createElement("section");
  uses.className = "insight-grid";
  const usesTitle = document.createElement("h2");
  usesTitle.textContent = "What it helps with";
  uses.append(usesTitle);
  for (const item of [
    {
      heading: "Better search",
      body: "Applications can find Amharic entities and facts more reliably than by keyword matching alone.",
    },
    {
      heading: "Reusable data",
      body: "Researchers and developers can build tools without starting from raw Wikipedia text every time.",
    },
    {
      heading: "Language inclusion",
      body: "Amharic knowledge becomes easier to connect with global datasets while keeping the language visible.",
    },
  ]) {
    const card = document.createElement("article");
    card.className = "insight-card";
    const headingElement = document.createElement("h3");
    headingElement.textContent = item.heading;
    const bodyElement = document.createElement("p");
    bodyElement.textContent = item.body;
    card.append(headingElement, bodyElement);
    uses.append(card);
  }

  const action = document.createElement("a");
  action.className = "button-link button-link--primary";
  action.href = appHref("/tools");
  action.textContent = "Explore tools and releases";

  section.append(title, intro, overview, why, steps, uses, action);
  layout.main.append(section);
}
