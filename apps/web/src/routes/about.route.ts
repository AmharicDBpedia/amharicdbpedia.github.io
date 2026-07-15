import { chapterMetrics, researchHighlights } from "@amdb/content";
import { pickLocalized } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";

export function renderAbout(layout: AppLayout): void {
  clear(layout.main);
  const language = layout.getLanguage();

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

  const timeline = document.createElement("section");
  timeline.className = "about-timeline";
  const timelineTitle = document.createElement("h2");
  timelineTitle.textContent = "From chapter idea to reusable graph";
  const timelineIntro = document.createElement("p");
  timelineIntro.textContent =
    "The work has moved through mentorship, mapping, extraction, publication, and the tools that make the result understandable.";
  const timelineList = document.createElement("div");
  timelineList.className = "about-timeline__list";
  const milestones = [
    {
      date: "2024",
      title: "Chapter foundation",
      body: "The first GSoC cycle established the Amharic DBpedia workflow: work from Amharic Wikipedia, maintain template-to-ontology mappings, run extraction, and publish the resulting RDF artifacts.",
      link: "https://github.com/Meti-Adane/GSOC-24_DBpedia_Amharic_Chapter",
      linkLabel: "Open the 2024 project",
    },
    {
      date: "2025",
      title: "Mapping coverage becomes measurable",
      body: "The chapter added a stronger mapping baseline, including complete template coverage reporting, property coverage, property occurrences, and a repeatable way to compare mapping improvements.",
      link: "https://github.com/contact-andy/GSoC-25_DBpedia_Amharic_Chapter",
      linkLabel: "Open the 2025 project",
    },
    {
      date: "2025–2026",
      title: "Extraction artifacts are published",
      body: "The release path separated raw, metadata, and mapping-based artifacts, connected output to Databus, and documented the RDF pipeline so the generated graph can be downloaded and reused.",
      link: "https://databus.dbpedia.org/purplebee/collections/am_chapter/",
      linkLabel: "Open the Databus collection",
    },
    {
      date: "2026",
      title: "The graph becomes explorable",
      body: "The website grew into a working interface for resource search, SPARQL, resource facts, predicate explanations, query examples, release statistics, and documentation for contributors.",
      link: appHref("/docs"),
      linkLabel: "Read the implementation docs",
    },
    {
      date: "2026",
      title: "Research release",
      body: "The chapter’s extraction and mapping work was documented in the LREC 2026 research release, giving the community a citable account of the graph and its language-aware processing decisions.",
      link: "https://lrec.elra.info/lrec2026-main-627",
      linkLabel: "Read the LREC 2026 paper",
    },
  ];
  for (const milestone of milestones) {
    const item = document.createElement("article");
    item.className = "about-timeline__item";
    const date = document.createElement("span");
    date.className = "about-timeline__date";
    date.textContent = milestone.date;
    const content = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = milestone.title;
    const body = document.createElement("p");
    body.textContent = milestone.body;
    const link = document.createElement("a");
    link.href = milestone.link;
    if (milestone.link.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    link.textContent = milestone.linkLabel;
    content.append(heading, body, link);
    item.append(date, content);
    timelineList.append(item);
  }
  timeline.append(timelineTitle, timelineIntro, timelineList);

  const statistics = document.createElement("section");
  statistics.className = "home-statistics about-statistics";
  statistics.id = "statistics";
  const statisticsHeader = document.createElement("div");
  statisticsHeader.className = "home-statistics__header";
  const statisticsTitle = document.createElement("h2");
  statisticsTitle.textContent = "Chapter at a glance";
  const statisticsIntro = document.createElement("p");
  statisticsIntro.textContent =
    "A clear snapshot of the current release: coverage, mapped properties, and published graph facts.";
  statisticsHeader.append(statisticsTitle, statisticsIntro);
  const metrics = document.createElement("div");
  metrics.className = "metric-grid";
  for (const metric of chapterMetrics) {
    const card = document.createElement("article");
    card.className = `metric metric--${metric.tone ?? "primary"}`;
    const value = document.createElement("strong");
    value.textContent = metric.value;
    const label = document.createElement("span");
    label.textContent = pickLocalized(metric.label, language) ?? "";
    const detail = document.createElement("p");
    detail.textContent = pickLocalized(metric.detail, language) ?? "";
    card.append(value, label, detail);
    metrics.append(card);
  }
  statistics.append(statisticsHeader, metrics);

  const research = document.createElement("section");
  research.className = "insight-grid about-research";
  const researchHeading = document.createElement("h2");
  researchHeading.textContent = "What makes this chapter different";
  research.append(researchHeading);
  for (const highlight of researchHighlights) {
    const card = document.createElement("article");
    card.className = "insight-card";
    const heading = document.createElement("h3");
    heading.textContent = pickLocalized(highlight.title, language) ?? "";
    const body = document.createElement("p");
    body.textContent = pickLocalized(highlight.body, language) ?? "";
    card.append(heading, body);
    research.append(card);
  }

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

  section.append(title, intro, overview, why, steps, timeline, statistics, research, uses);
  layout.main.append(section);
}
