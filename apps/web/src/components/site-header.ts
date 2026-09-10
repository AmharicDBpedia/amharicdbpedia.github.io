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

  const menuToggle = document.createElement("button");
  menuToggle.className = "site-nav__toggle";
  menuToggle.type = "button";
  menuToggle.ariaLabel = "Open navigation";
  menuToggle.ariaExpanded = "false";
  menuToggle.innerHTML = "<span></span><span></span><span></span>";
  menuToggle.addEventListener("click", () => {
    const open = header.classList.toggle("site-header--menu-open");
    menuToggle.ariaExpanded = String(open);
    menuToggle.ariaLabel = open ? "Close navigation" : "Open navigation";
  });

  for (const item of props.navigation) {
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

  inner.append(brand, nav, menuToggle);
  header.append(inner);
  return header;
}
