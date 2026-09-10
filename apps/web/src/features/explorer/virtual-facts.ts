import { compactIri, type SparqlJsonBinding } from "@amdb/core";
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
} from "@tanstack/virtual-core";
import type { Triple } from "./data";

export function termLabel(term: SparqlJsonBinding): string {
  if (term.type === "uri") return compactIri(term.value);
  if (term.type === "bnode") return `_:${term.value}`;
  return `"${term.value}"${term["xml:lang"] ? `@${term["xml:lang"]}` : term.datatype ? `^^${compactIri(term.datatype)}` : ""}`;
}

export function createVirtualFacts(host: HTMLElement, onSelect: (iri: string) => void) {
  let rows: readonly Triple[] = [];
  const viewport = document.createElement("div");
  viewport.className = "atlas-facts__viewport";
  viewport.tabIndex = 0;
  viewport.setAttribute("role", "table");
  viewport.setAttribute("aria-label", "RDF facts in this page");
  viewport.setAttribute("aria-colcount", "3");
  const header = document.createElement("div");
  header.className = "atlas-facts__header";
  header.setAttribute("role", "row");
  header.setAttribute("aria-rowindex", "1");
  for (const name of ["Subject", "Relationship", "Object / value"]) {
    const cell = document.createElement("span");
    cell.setAttribute("role", "columnheader");
    cell.textContent = name;
    header.append(cell);
  }
  const body = document.createElement("div");
  body.className = "atlas-facts__body";
  body.setAttribute("role", "rowgroup");
  viewport.append(header, body);
  host.append(viewport);
  const virtualizer = new Virtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => viewport,
    estimateSize: () => 52,
    overscan: 5,
    scrollMargin: 40,
    scrollToFn: elementScroll,
    observeElementRect,
    observeElementOffset,
    onChange: () => render(),
  });
  function render() {
    body.style.height = `${virtualizer.getTotalSize()}px`;
    const fragment = document.createDocumentFragment();
    for (const item of virtualizer.getVirtualItems()) {
      const triple = rows[item.index];
      if (!triple) continue;
      const row = document.createElement("div");
      row.className = "atlas-facts__row";
      row.setAttribute("role", "row");
      row.setAttribute("aria-rowindex", String(item.index + 2));
      row.style.transform = `translateY(${item.start - 40}px)`;
      for (const term of [triple.subject, triple.predicate, triple.object]) {
        const cell = document.createElement("div");
        cell.setAttribute("role", "cell");
        cell.title = termLabel(term);
        if (term.type === "uri") {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = termLabel(term);
          button.onclick = () => onSelect(term.value);
          cell.append(button);
        } else cell.textContent = termLabel(term);
        row.append(cell);
      }
      fragment.append(row);
    }
    // Scroll updates never create DOM for offscreen rows.
    body.replaceChildren(fragment);
  }
  const dispose = virtualizer._didMount();
  virtualizer._willUpdate();
  return {
    setRows(next: readonly Triple[]) {
      rows = next;
      viewport.scrollTop = 0;
      viewport.setAttribute("aria-rowcount", String(rows.length + 1));
      virtualizer.setOptions({ ...virtualizer.options, count: rows.length });
      virtualizer._willUpdate();
      render();
    },
    dispose,
  };
}
