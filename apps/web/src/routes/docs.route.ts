import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";

interface Milestone {
  readonly date: string;
  readonly label: string;
  readonly title: string;
  readonly body: string;
  readonly links: readonly { label: string; href: string }[];
}

const milestones: readonly Milestone[] = [
  {
    date: "2024",
    label: "GSoC · foundation",
    title: "The Amharic chapter takes shape",
    body: "The first GSoC cycle established the chapter workflow: Amharic Wikipedia input, template mappings, extraction, and a published RDF release.",
    links: [
      {
        label: "Meti’s GSoC project",
        href: "https://github.com/Meti-Adane/GSOC-24_DBpedia_Amharic_Chapter",
      },
      { label: "RDF pipeline guide", href: "/docs/rdf-pipeline.md" },
    ],
  },
  {
    date: "2025",
    label: "GSoC · mapping coverage",
    title: "Mappings become measurable",
    body: "The chapter moved from a working extraction path to a measurable mapping baseline, tracking template coverage, property coverage, and emitted occurrences.",
    links: [
      {
        label: "Andargachew’s GSoC project",
        href: "https://github.com/contact-andy/GSoC-25_DBpedia_Amharic_Chapter",
      },
      { label: "Contributor guide", href: "/docs/contributor-guide.md" },
    ],
  },
  {
    date: "2026",
    label: "GSoC · release tooling",
    title: "Statistics and explanations arrive",
    body: "The current work connects extraction artifacts to statistics, mapping explanations, resource exploration, and a frontend that makes the graph easier to inspect.",
    links: [
      {
        label: "Natnael’s GSoC project",
        href: "https://nama21yo.github.io/natnael-work/blog/gsoc/2026/",
      },
      { label: "Frontend implementation", href: "/docs/frontend-implementation.md" },
    ],
  },
  {
    date: "2026",
    label: "Research release",
    title: "The chapter is ready to be reused",
    body: "The published research and release artifacts document the graph’s coverage, extraction decisions, and the path for researchers and builders to query and reuse it.",
    links: [
      { label: "Read the LREC 2026 paper", href: "https://lrec.elra.info/lrec2026-main-627" },
      { label: "Architecture", href: "/docs/architecture.md" },
      {
        label: "Databus collection",
        href: "https://databus.dbpedia.org/purplebee/collections/am_chapter/",
      },
    ],
  },
];

export function renderDocs(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section docs-page";
  const title = document.createElement("h1");
  title.textContent = "How the chapter grew";
  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent =
    "A living timeline of the Amharic DBpedia implementation, from the first mapping work to the current research release.";

  const timeline = document.createElement("div");
  timeline.className = "docs-timeline";
  for (const [index, milestone] of milestones.entries()) {
    const item = document.createElement("article");
    item.className = `docs-timeline__item${index % 2 === 0 ? " docs-timeline__item--left" : " docs-timeline__item--right"}`;
    const date = document.createElement("div");
    date.className = "docs-timeline__date";
    date.textContent = milestone.date;
    const marker = document.createElement("span");
    marker.className = "docs-timeline__marker";
    const card = document.createElement("div");
    card.className = "docs-timeline__card";
    const label = document.createElement("p");
    label.className = "eyebrow";
    label.textContent = milestone.label;
    const heading = document.createElement("h2");
    heading.textContent = milestone.title;
    const body = document.createElement("p");
    body.textContent = milestone.body;
    const links = document.createElement("div");
    links.className = "docs-timeline__links";
    for (const link of milestone.links) {
      const anchor = document.createElement("a");
      anchor.href = link.href.startsWith("/") ? appHref(link.href) : link.href;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      anchor.textContent = link.label;
      links.append(anchor);
    }
    card.append(label, heading, body, links);
    item.append(date, marker, card);
    timeline.append(item);
  }

  section.append(title, intro, timeline);
  layout.main.append(section);
}
