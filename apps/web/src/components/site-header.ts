import type { LocalizedText, NavItem } from "@amdb/content";
import { appHref } from "../app/paths";

type HeaderNavItem = NavItem & { readonly icon?: "github" };

interface SiteHeaderProps {
  readonly navigation: readonly HeaderNavItem[];
  readonly localize: (value: LocalizedText) => string;
}

export function renderSiteHeader(props: SiteHeaderProps): HTMLElement {
  const header = document.createElement("header");
  header.className = "site-header";

  const inner = document.createElement("div");
  inner.className = "site-header__inner";

  const brand = document.createElement("a");
  brand.href = appHref("/");
  brand.className = "brand";
  const logo = document.createElement("img");
  logo.src = appHref("/assets/images/dbpedia_am_logo.png");
  logo.alt = "";
  logo.width = 34;
  logo.height = 34;
  const brandText = document.createElement("span");
  brandText.textContent = "Amharic DBpedia";
  brand.append(logo, brandText);

  const nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.setAttribute("aria-label", "Primary");

  for (const item of props.navigation) {
    if (item.href === "/tools") {
      const group = document.createElement("details");
      group.className = "site-nav__group";
      const summary = document.createElement("summary");
      summary.textContent = props.localize(item.label);
      const menu = document.createElement("div");
      menu.className = "site-nav__group-menu";
      for (const entry of [
        ["Tools & publications", "/tools"],
        ["SPARQL", "/sparql"],
        ["News", "/news"],
        ["Resources", "/resource"],
        ["Statistics", "/statistics"],
      ] as const) {
        const menuLink = document.createElement("a");
        menuLink.href = appHref(entry[1]);
        menuLink.textContent = entry[0];
        menu.append(menuLink);
      }
      group.append(summary, menu);
      nav.append(group);
      continue;
    }
    const link = document.createElement("a");
    link.href = appHref(item.href);
    if (item.href.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    if (item.icon === "github") {
      link.className = "site-nav__icon-link";
      link.ariaLabel = props.localize(item.label);
      const icon = document.createElement("img");
      icon.src = appHref("/assets/images/github-logo.png");
      icon.alt = "";
      icon.width = 22;
      icon.height = 22;
      link.append(icon);
    } else {
      link.textContent = props.localize(item.label);
    }
    nav.append(link);
  }

  inner.append(brand, nav);
  header.append(inner);
  return header;
}
