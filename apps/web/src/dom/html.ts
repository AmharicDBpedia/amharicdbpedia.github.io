export function clear(node: Element): void {
  while (node.firstChild) node.firstChild.remove();
}

export function text(tagName: keyof HTMLElementTagNameMap, value: string): HTMLElement {
  const element = document.createElement(tagName);
  element.textContent = value;
  return element;
}

export function externalLink(href: string, label: string): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = label;
  return anchor;
}

export function iconButton(label: string, symbol: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "icon-button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.textContent = symbol;
  return button;
}

export type IconName =
  | "arrow-right"
  | "book-open"
  | "chart-line"
  | "code"
  | "database"
  | "download"
  | "external-link"
  | "eye"
  | "magnifying-glass"
  | "play"
  | "right-from-bracket";

const iconPaths: Record<IconName, string> = {
  "arrow-right":
    "M438.6 278.6l-160 160c-4.6 4.6-11 7.4-17.6 7.4-13.8 0-25-11.2-25-25v-80H25c-13.8 0-25-11.2-25-25s11.2-25 25-25h211v-80c0-13.8 11.2-25 25-25 6.6 0 13 2.6 17.6 7.4l160 160c9.8 9.8 9.8 25.6 0 35.4z",
  "book-open":
    "M0 64C0 46.3 14.3 32 32 32h192v384H32c-17.7 0-32-14.3-32-32V64zm256 352V32h192c17.7 0 32 14.3 32 32v320c0 17.7-14.3 32-32 32H256z",
  "chart-line":
    "M32 32c17.7 0 32 14.3 32 32v352h352c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32zM96 352l96-96 64 64 128-160 48 38.4-152 190a32 32 0 0 1-45.3 2.3l-64-64-51.4 51.3L96 352z",
  code: "M9.4 233.4l128-128 45.3 45.3L77.3 256l105.4 105.4-45.3 45.3-128-128a32 32 0 0 1 0-45.3zm469.3 0a32 32 0 0 1 0 45.3l-128 128-45.3-45.3L410.7 256 305.3 150.6l45.3-45.3 128 128z",
  database:
    "M480 128v256c0 53-107.5 96-240 96S0 437 0 384V128h480zM240 32C107.5 32 0 75 0 128s107.5 96 240 96 240-43 240-96S372.5 32 240 32z",
  download:
    "M288 32v256h80c13.8 0 25 11.2 25 25 0 6.6-2.6 13-7.4 17.6l-128 128a25 25 0 0 1-35.4 0l-128-128c-4.8-4.6-7.4-11-7.4-17.6 0-13.8 11.2-25 25-25h80V32h96zM0 416h96v64H0v-64zm384 0h96v64h-96v-64z",
  "external-link":
    "M288 32h160c17.7 0 32 14.3 32 32v160h-64V109.3L226.7 298.7 181.3 253.3 370.7 64H288V32zM64 96h128v64H96v224h224V288h64v128c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32z",
  eye: "M480 256s-96 160-240 160S0 256 0 256 96 96 240 96s240 160 240 160zM240 352a96 96 0 1 0 0-192 96 96 0 0 0 0 192z",
  "magnifying-glass":
    "M336 304h-17l-6-6a140 140 0 1 0-15 15l6 6v17l88 88 30-30-86-90zM144 304a96 96 0 1 1 0-192 96 96 0 0 1 0 192z",
  play: "M96 64c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32a32 32 0 0 0 17-4.9l256-160a32 32 0 0 0 0-54.2L113 68.9A32 32 0 0 0 96 64z",
  "right-from-bracket":
    "M352 64h64c35.3 0 64 28.7 64 64v256c0 35.3-28.7 64-64 64H352v-64h64V128h-64V64zM240 128l128 128-128 128v-80H0v-96h240v-80z",
};

export function faIcon(name: IconName): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("ui-icon");
  svg.setAttribute("viewBox", "0 0 512 512");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute("d", iconPaths[name]);
  svg.append(path);
  return svg;
}

export function appendIconLabel(element: HTMLElement, name: IconName, label: string): void {
  element.append(faIcon(name), document.createTextNode(label));
}
