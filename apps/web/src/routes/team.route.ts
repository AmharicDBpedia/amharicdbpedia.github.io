import { contributors, teamMembers } from "@amdb/content";
import type { AppLayout } from "../app/layout";
import { clear, externalLink } from "../dom/html";

export function renderTeam(layout: AppLayout): void {
  clear(layout.main);

  const section = document.createElement("section");
  section.className = "page-section";

  const active = teamMembers.filter((member) => member.status === "active");
  const previous = teamMembers.filter((member) => member.status === "previous");
  const sections = document.createElement("div");
  sections.className = "team-sections";
  sections.append(memberSection("Active", active), memberSection("Alumni", previous));

  const gsoc = document.createElement("section");
  gsoc.className = "people-strip";
  const gsocTitle = document.createElement("h2");
  gsocTitle.textContent = "GSoC contributors";
  gsoc.append(gsocTitle, contributorGrid());

  section.append(sections, gsoc);
  layout.main.append(section);
}

function memberSection(label: string, members: typeof teamMembers): HTMLElement {
  const section = document.createElement("section");
  section.className = "team-group";
  const heading = document.createElement("div");
  heading.className = "team-group__heading";
  const title = document.createElement("h2");
  title.textContent = label;
  heading.append(title);
  const grid = document.createElement("div");
  grid.className = "team-grid";
  members.forEach((member) => {
    grid.append(memberCard(member));
  });
  section.append(heading, grid);
  return section;
}

function memberCard(member: (typeof teamMembers)[number]): HTMLElement {
  const card = document.createElement("article");
  card.className = "team-card";
  const period = document.createElement("p");
  period.className = "team-card__period";
  period.textContent = member.period;
  const content = document.createElement("div");
  content.className = "team-card__content";
  const name = document.createElement("h3");
  name.textContent = member.name;
  const role = document.createElement("p");
  role.className = "team-card__role";
  role.textContent = member.role;
  const affiliation = document.createElement("p");
  affiliation.textContent = member.affiliation;
  content.append(name, role, affiliation);
  if (member.href) {
    content.append(externalLink(member.href, member.profileLabel ?? "Profile"));
  }
  card.append(content, period);
  return card;
}

function contributorGrid(): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "contributor-grid";
  [...contributors]
    .sort((a, b) => Number(a.year.replace(/\D/g, "")) - Number(b.year.replace(/\D/g, "")))
    .forEach((contributor) => {
      const card = document.createElement("article");
      card.className = "contributor-card";
      const year = document.createElement("span");
      year.className = "contributor-card__year";
      year.textContent = contributor.year;
      const link = externalLink(contributor.href, contributor.name);
      const role = document.createElement("p");
      role.textContent = contributor.role;
      card.append(year, link, role);
      grid.append(card);
    });
  return grid;
}
