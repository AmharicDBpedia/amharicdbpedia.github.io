import { toIri } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";
import { loadRawResource, type RawResourceFormat } from "../services/resource.service";

const formats = new Set<RawResourceFormat>(["turtle", "jsonld", "ntriples", "rdfxml"]);

export async function renderResourcePreview(layout: AppLayout, url: URL): Promise<void> {
  clear(layout.main);
  const iri = url.searchParams.get("iri") ?? "";
  const requestedFormat = url.searchParams.get("format") ?? "turtle";
  const format: RawResourceFormat = formats.has(requestedFormat as RawResourceFormat)
    ? (requestedFormat as RawResourceFormat)
    : "turtle";

  const section = document.createElement("section");
  section.className = "page-section resource-preview-page";
  const back = document.createElement("a");
  back.href = appHref(`/resource/${encodeURIComponent(iri)}`);
  back.textContent = "← Back to resource";
  const title = document.createElement("h1");
  title.textContent = `${formatLabel(format)} preview`;
  const description = document.createElement("p");
  description.className = "lead";
  description.textContent = `RDF preview for ${iri}`;
  const pre = document.createElement("pre");
  pre.className = "raw-panel resource-preview-page__content";
  pre.textContent = "Loading RDF…";
  section.append(back, title, description, pre);
  layout.main.append(section);

  try {
    const raw = await loadRawResource(toIri(iri), format);
    pre.textContent = format === "jsonld" ? prettyJson(raw) : raw;
  } catch (error) {
    pre.textContent = error instanceof Error ? error.message : "Failed to load RDF preview";
  }
}

function formatLabel(format: RawResourceFormat): string {
  return { turtle: "Turtle", jsonld: "JSON-LD", ntriples: "N-Triples", rdfxml: "RDF/XML" }[format];
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
