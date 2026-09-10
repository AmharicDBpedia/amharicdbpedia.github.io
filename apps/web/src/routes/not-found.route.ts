import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear, text } from "../dom/html";
import { renderResourceSearch } from "../features/search/resource-search";
import "../components/recovery.css";

export function renderNotFound(layout: AppLayout): void {
  clear(layout.main);
  const section = document.createElement("section");
  section.className = "missing-page";
  const intro = document.createElement("div");
  intro.className = "missing-page__intro";
  const copy = document.createElement("div");
  const label = text("p", "Amharic DBpedia / Missing page");
  label.className = "missing-page__label";
  const title = document.createElement("h1");
  title.textContent = "Page not found";
  const description = text(
    "p",
    "This address does not match a page on Amharic DBpedia. Check the link, or continue exploring from one of the places below.",
  );
  const code = text("p", "404");
  code.className = "missing-page__code";
  const actions = document.createElement("div");
  actions.className = "missing-page__actions";
  const link = document.createElement("a");
  link.href = appHref("/");
  link.textContent = "Return home";
  link.className = "button-link";
  const resources = document.createElement("a");
  resources.href = appHref("/tools");
  resources.textContent = "Explore Resources";
  resources.className = "button-link button-link--primary";
  actions.append(resources, link);
  copy.append(label, title, description, actions);
  intro.append(copy, code);
  const search = document.createElement("section");
  search.className = "missing-page__search";
  search.append(text("h2", "Looking for a person, place or idea?"), renderResourceSearch(layout));
  section.append(intro, search);
  layout.main.append(section);
  layout.main.focus({ preventScroll: true });
}
