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
  pre.textContent = "Loading RDF…";
  const actions = document.createElement("div");
  actions.className = "resource-preview-page__actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "Copy RDF";
  copy.disabled = true;
  const theme = document.createElement("button");
  theme.type = "button";
  theme.textContent = "Use light theme";
  const status = document.createElement("span");
  status.className = "status";
  actions.append(copy, theme, status);
  theme.addEventListener("click", () => {
    const light = section.classList.toggle("resource-preview-page--light");
    theme.textContent = light ? "Use dark theme" : "Use light theme";
  });
  section.append(back, title, description, actions, pre);
  layout.main.append(section);

  try {
    const raw = await loadRawResource(toIri(iri), format);
    const content = format === "jsonld" ? prettyJson(raw) : raw;
    pre.textContent = content;
    copy.disabled = false;
    copy.addEventListener("click", () => {
      void navigator.clipboard.writeText(content).then(
        () => {
          status.textContent = "Copied";
        },
        () => {
          status.textContent = "Copy failed";
        },
      );
    });
  } catch (error) {
    pre.textContent = error instanceof Error ? error.message : "Failed to load RDF preview";
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
