import { toIri } from "@amdb/core";
import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { clear } from "../dom/html";
import { loadRawResource, type RawResourceFormat } from "../services/resource.service";

const formats = new Set<RawResourceFormat>(["turtle", "jsonld", "ntriples"]);

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
  const code = document.createElement("code");
  code.textContent = "Loading RDF…";
  const copy = document.createElement("button");
  copy.className = "resource-preview-page__copy";
  copy.type = "button";
  copy.ariaLabel = "Copy RDF";
  copy.title = "Copy RDF";
  copy.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 512 512"><path fill="currentColor" d="M384 0H128C57.3 0 0 57.3 0 128v256h64V128c0-35.3 28.7-64 64-64h256V0zm64 128H192c-35.3 0-64 28.7-64 64v256c0 35.3 28.7 64 64 64h256c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64zm0 320H192V192h256v256z"/></svg><span class="visually-hidden">Copy RDF</span>';
  copy.disabled = true;
  const status = document.createElement("span");
  status.className = "status";
  pre.append(copy, code);
  section.append(back, title, description, pre, status);
  layout.main.append(section);

  try {
    const raw = await loadRawResource(toIri(iri), format);
    const content = format === "jsonld" ? prettyJson(raw) : raw;
    code.textContent = content;
    copy.disabled = false;
    copy.addEventListener("click", () => {
      void navigator.clipboard.writeText(content).then(
        () => {
          status.textContent = "Copied";
          copy.classList.add("resource-preview-page__copy--copied");
          copy.ariaLabel = "Copied RDF";
          copy.title = "Copied";
          window.setTimeout(() => {
            copy.classList.remove("resource-preview-page__copy--copied");
            copy.ariaLabel = "Copy RDF";
            copy.title = "Copy RDF";
            status.textContent = "";
          }, 1800);
        },
        () => {
          status.textContent = "Copy failed";
        },
      );
    });
  } catch (error) {
    code.textContent = error instanceof Error ? error.message : "Failed to load RDF preview";
  }
}

function formatLabel(format: RawResourceFormat): string {
  return { turtle: "Turtle", jsonld: "JSON-LD", ntriples: "N-Triples" }[format];
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
