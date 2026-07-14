import { contributors, teamMembers } from "@amdb/content";
import { pickLocalized } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { clear, externalLink } from "../dom/html";

export function renderTeam(layout: AppLayout): void {
  clear(layout.main);
  const language = layout.getLanguage();

  const section = document.createElement("section");
  section.className = "page-section";

  const active = teamMembers.filter((member) => member.status === "active");
  const previous = teamMembers.filter((member) => member.status === "previous");
  const sections = document.createElement("div");
  sections.className = "team-sections";
  sections.append(
    memberSection("Active", active, language),
    memberSection("Alumni", previous, language),
  );

  const gsoc = document.createElement("section");
  gsoc.className = "people-strip";
  const gsocTitle = document.createElement("h2");
  gsocTitle.textContent = "GSoC contributors";
  gsoc.append(gsocTitle, contributorGrid(language));

  section.append(sections, gsoc);
  layout.main.append(section);
}

function memberSection(
  label: string,
  members: typeof teamMembers,
  language: ReturnType<AppLayout["getLanguage"]>,
): HTMLElement {
  const section = document.createElement("section");
  section.className = `team-group${label === "Active" ? " team-group--timeline" : ""}`;
  const heading = document.createElement("div");
  heading.className = "team-group__heading";
  const title = document.createElement("h2");
  title.textContent = label;
  heading.append(title);
  const grid = document.createElement("div");
  grid.className = "team-grid";
  [...members]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((member) => {
      const card = memberCard(member, language, label === "Active");
      grid.append(card);
    });
  section.append(heading, grid);
  return section;
}

function memberCard(
  member: (typeof teamMembers)[number],
  language: ReturnType<AppLayout["getLanguage"]>,
  timeline: boolean,
): HTMLElement {
  const card = document.createElement("article");
  card.className = `team-card${timeline ? " team-card--timeline" : ""}`;
  const period = document.createElement("p");
  period.className = "team-card__period";
  period.textContent = member.period;
  const content = document.createElement("div");
  content.className = "team-card__content";
  const avatar = document.createElement("div");
  avatar.className = "team-card__avatar";
  if (member.image) {
    const portrait = document.createElement("img");
    portrait.className = "team-card__avatar team-card__avatar--image";
    portrait.src = member.image;
    portrait.alt = `${member.name} profile photo`;
    portrait.loading = "lazy";
    content.append(portrait);
  } else {
    avatar.textContent = initials(member.name);
    content.append(avatar);
  }
  const name = document.createElement("h3");
  name.textContent = member.name;
  const role = document.createElement("p");
  role.className = "team-card__role";
  role.textContent = pickLocalized(member.role, language) ?? "";
  const affiliation = document.createElement("p");
  affiliation.textContent = member.affiliation;
  content.append(name, role, affiliation);
  if (member.href) content.append(externalLink(member.href, "Profile"));
  card.append(period, content);
  return card;
}

function contributorGrid(language: ReturnType<AppLayout["getLanguage"]>): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "contributor-grid";
  [...contributors]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((contributor) => {
      const card = document.createElement("article");
      card.className = "contributor-card";
      if (contributor.image) {
        const image = document.createElement("img");
        image.className = "contributor-card__image";
        image.src = contributor.image;
        image.alt = `${contributor.name} profile photo`;
        image.loading = "lazy";
        card.append(image);
      }
      const year = document.createElement("span");
      year.className = "contributor-card__year";
      year.textContent = contributor.year;
      const link = externalLink(contributor.href, contributor.name);
      const role = document.createElement("p");
      role.textContent = pickLocalized(contributor.role, language) ?? "";
      card.append(year, link, role);
      grid.append(card);
    });
  return grid;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
