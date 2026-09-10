import { localName } from "@amdb/core";
import { appHref } from "../../app/paths";
import { renderEndpointError } from "../../components/endpoint-error";
import { text } from "../../dom/html";
import { loadTriplePage, PAGE_SIZE, type Triple } from "./data";
import { buildGraph } from "./model";
import { createNetwork } from "./network";
import { createVirtualFacts, termLabel } from "./virtual-facts";
import "./explorer.css";

export function mountExplorer(host: HTMLElement): () => void {
  const root = document.createElement("section");
  root.className = "atlas";
  root.setAttribute("aria-label", "Knowledge explorer");
  // Static markup only; all endpoint content is inserted with textContent.
  root.innerHTML = `
    <header class="atlas-heading">
      <div><p class="atlas-eyebrow">AMHARIC DBPEDIA / KNOWLEDGE EXPLORER</p>
      <h2>Follow a connection.</h2>
      <p>Explore the people, places and ideas connected in Amharic Wikipedia.</p></div>
      <span class="atlas-script" lang="am" aria-label="Knowledge">እውቀት</span>
    </header>
    <form class="atlas-search" role="search">
      <label for="atlas-resource">Explore a resource</label>
      <div><input id="atlas-resource" type="search" placeholder="Amharic title or full IRI" autocomplete="off" />
      <button type="submit">Explore connections</button><button type="button" data-action="all">Browse all</button></div>
    </form>
    <div class="atlas-examples"><span>Start with</span></div>
    <div class="atlas-error"></div>
    <div class="atlas-toolbar"><h3>Relationship map</h3><span class="atlas-count"></span>
      <div class="atlas-zoom"><button type="button" data-action="out" aria-label="Zoom out">−</button>
      <button type="button" data-action="in" aria-label="Zoom in">+</button>
      <button type="button" data-action="reset">Reset view</button></div></div>
    <div class="atlas-workspace">
      <div class="atlas-map"><div class="atlas-canvas"></div><p class="atlas-map-message"></p>
      <div class="atlas-legend"><span>Subject</span><span>Linked resource</span><span>Selected</span></div></div>
      <aside class="atlas-inspector" aria-label="Selected resource" aria-live="polite"></aside>
    </div>
    <p class="atlas-caption">This page of the graph, not the full dataset. Lines connect resources; literal values appear in the facts below. Drag to pan, or use arrow keys on the map to select.</p>
    <div class="atlas-facts-heading"><h3>Facts behind the connections</h3><p>Subject → relationship → object</p></div>
    <p class="atlas-status" role="status"></p>
    <div class="atlas-facts"></div>
    <div class="atlas-pagination"><button type="button" data-action="previous">Previous page</button>
      <span class="atlas-page"></span><button type="button" data-action="next">Next page</button></div>`;
  host.append(root);
  function get<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing explorer element: ${selector}`);
    return element;
  }
  const input = get<HTMLInputElement>("input");
  const status = get(".atlas-status");
  const inspector = get(".atlas-inspector");
  const previous = get<HTMLButtonElement>('[data-action="previous"]');
  const next = get<HTMLButtonElement>('[data-action="next"]');
  const errorHost = get(".atlas-error");
  const dataPanels = [
    ".atlas-toolbar",
    ".atlas-workspace",
    ".atlas-caption",
    ".atlas-facts-heading",
    ".atlas-facts",
  ].map((selector) => get(selector));
  let rows: Triple[] = [];
  let resource = "";
  let page = 0;
  let request: AbortController | undefined;
  let disposed = false;

  function inspect(iri: string) {
    network.select(iri);
    inspector.replaceChildren(
      text("p", "SELECTED RESOURCE"),
      text("h3", localName(iri)),
      text("code", iri),
    );
    const connections = rows.filter(
      (row) => row.subject.value === iri || (row.object.type === "uri" && row.object.value === iri),
    );
    inspector.append(text("p", `${connections.length.toLocaleString()} facts in this page`));
    const list = document.createElement("ul");
    for (const row of connections.slice(0, 5)) {
      list.append(
        text(
          "li",
          `${termLabel(row.subject)} → ${termLabel(row.predicate)} → ${termLabel(row.object)}`,
        ),
      );
    }
    inspector.append(list);
    const explore = document.createElement("button");
    explore.type = "button";
    explore.textContent = "Explore this resource";
    explore.onclick = () => {
      input.value = iri;
      resource = iri;
      page = 0;
      void load();
    };
    const details = document.createElement("a");
    details.textContent = "Open full resource";
    details.href = appHref(`/resource/${encodeURIComponent(iri)}`);
    inspector.append(explore, details);
  }
  const network = createNetwork(get(".atlas-canvas"), (node) => inspect(node.id));
  const facts = createVirtualFacts(get(".atlas-facts"), inspect);
  function clearSelection() {
    inspector.replaceChildren(
      text("p", "RESOURCE INSPECTOR"),
      text("h3", "Every point has a story."),
      text("p", "Select a point on the map or a resource in the facts to see its connections."),
    );
  }
  async function load() {
    request?.abort();
    const controller = new AbortController();
    request = controller;
    previous.disabled = true;
    next.disabled = true;
    errorHost.replaceChildren();
    get(".atlas-pagination").hidden = false;
    for (const panel of dataPanels) panel.hidden = false;
    rows = [];
    facts.setRows(rows);
    network.setGraph(buildGraph(rows));
    clearSelection();
    root.setAttribute("aria-busy", "true");
    status.textContent = "Loading facts from the Amharic DBpedia endpoint...";
    get(".atlas-map-message").textContent = "Loading connections...";
    get(".atlas-count").textContent = "";
    get(".atlas-page").textContent = `Page ${(page + 1).toLocaleString()}`;
    try {
      const result = await loadTriplePage(resource, page, controller.signal);
      if (disposed || request !== controller) return;
      rows = result.rows;
      const graph = buildGraph(rows);
      network.setGraph(graph);
      facts.setRows(rows);
      get(".atlas-count").textContent =
        `${graph.nodes.length.toLocaleString()} resources · ${graph.edges.length.toLocaleString()} connections`;
      get(".atlas-map-message").textContent = graph.nodes.length
        ? ""
        : "No resources to map in this page.";
      status.textContent = rows.length
        ? `Facts ${(page * PAGE_SIZE + 1).toLocaleString()}–${(page * PAGE_SIZE + rows.length).toLocaleString()}${result.hasNext ? ". More facts on the next page." : ". End of results."}`
        : "No facts found. Try another title or choose Browse all.";
      next.disabled = !result.hasNext;
    } catch (error) {
      if (disposed || request !== controller) return;
      status.textContent = "";
      for (const panel of dataPanels) panel.hidden = true;
      get(".atlas-pagination").hidden = page === 0;
      errorHost.replaceChildren(renderEndpointError(error, load, "Knowledge explorer"));
    } finally {
      if (!disposed && request === controller) {
        root.setAttribute("aria-busy", "false");
        previous.disabled = page === 0;
      }
    }
  }
  get<HTMLFormElement>("form").onsubmit = (event) => {
    event.preventDefault();
    resource = input.value.trim();
    page = 0;
    void load();
  };
  get('[data-action="all"]').onclick = () => {
    input.value = "";
    resource = "";
    page = 0;
    void load();
  };
  previous.onclick = () => {
    if (page > 0) {
      page--;
      void load();
    }
  };
  next.onclick = () => {
    page++;
    void load();
  };
  get('[data-action="in"]').onclick = () => network.zoom(1.3);
  get('[data-action="out"]').onclick = () => network.zoom(1 / 1.3);
  get('[data-action="reset"]').onclick = () => network.reset();
  for (const title of ["ዳኛቸው ወርቁ", "አዲስ አበባ", "ኢትዮጵያ"]) {
    const button = document.createElement("button");
    button.type = "button";
    button.lang = "am";
    button.textContent = title;
    button.onclick = () => {
      input.value = title;
      resource = title;
      page = 0;
      void load();
    };
    get(".atlas-examples").append(button);
  }
  void load();
  return () => {
    disposed = true;
    request?.abort();
    network.dispose();
    facts.dispose();
  };
}
