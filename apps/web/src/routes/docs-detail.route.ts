import type { AppLayout } from "../app/layout";
import { appHref } from "../app/paths";
import { appendIconLabel, clear } from "../dom/html";

const documents: Readonly<Record<string, { title: string; file: string }>> = {
  architecture: { title: "Architecture", file: "architecture.md" },
  "contributor-guide": { title: "Contributor guide", file: "contributor-guide.md" },
  "frontend-implementation": {
    title: "Frontend implementation",
    file: "frontend-implementation.md",
  },
  "rdf-pipeline": { title: "RDF pipeline", file: "rdf-pipeline.md" },
  "backend-api-demo-guide": {
    title: "Backend API demo guide",
    file: "backend-api-demo-guide.md",
  },
};

export async function renderDocsDetail(layout: AppLayout, slug: string): Promise<void> {
  clear(layout.main);
  const documentInfo = documents[slug];
  if (!documentInfo) {
    const { renderNotFound } = await import("./not-found.route");
    renderNotFound(layout);
    return;
  }

  const section = document.createElement("section");
  section.className = "page-section doc-reader";
  const back = document.createElement("a");
  back.href = appHref("/docs");
  appendIconLabel(back, "arrow-right", "Back to Docs");
  back.querySelector(".ui-icon")?.classList.add("ui-icon--back");
  const title = document.createElement("h1");
  title.textContent = documentInfo.title;
  const content = document.createElement("article");
  content.className = "markdown-body";
  content.textContent = "Loading document…";
  section.append(back, title, content);
  layout.main.append(section);

  try {
    const response = await fetch(appHref(`/docs/${documentInfo.file}`));
    if (!response.ok) throw new Error(`Unable to load ${documentInfo.file}`);
    content.replaceChildren(...renderMarkdown(await response.text()));
  } catch (error) {
    content.textContent = error instanceof Error ? error.message : "Unable to load this document.";
  }
}

function renderMarkdown(markdown: string): HTMLElement[] {
  const output: HTMLElement[] = [];
  let list: HTMLUListElement | HTMLOListElement | null = null;
  let code: string[] | null = null;

  const closeList = (): void => {
    if (list) output.push(list);
    list = null;
  };

  for (const line of markdown.split(/\r?\n/)) {
    if (line.trim().startsWith("```")) {
      if (code) {
        const pre = document.createElement("pre");
        const codeElement = document.createElement("code");
        codeElement.textContent = code.join("\n");
        pre.append(codeElement);
        output.push(pre);
        code = null;
      } else {
        closeList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      closeList();
      const hashes = heading[1] ?? "#";
      const element = document.createElement(`h${hashes.length}` as "h1" | "h2" | "h3");
      appendInline(element, heading[2] ?? "");
      output.push(element);
      continue;
    }

    const unordered = /^\s*[-*]\s+(.+)$/.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      const wanted = ordered ? "ol" : "ul";
      if (!list || list.tagName.toLowerCase() !== wanted) {
        closeList();
        list = document.createElement(wanted);
      }
      const item = document.createElement("li");
      appendInline(item, (unordered ?? ordered)?.[1] ?? "");
      list.append(item);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    closeList();
    const paragraph = document.createElement("p");
    appendInline(paragraph, line);
    output.push(paragraph);
  }

  closeList();
  if (code) {
    const pre = document.createElement("pre");
    pre.textContent = code.join("\n");
    output.push(pre);
  }
  return output;
}

function appendInline(container: HTMLElement, value: string): void {
  const pattern = /(`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    container.append(document.createTextNode(value.slice(cursor, index)));
    if (match[0].startsWith("`")) {
      const code = document.createElement("code");
      code.textContent = match[0].slice(1, -1);
      container.append(code);
    } else {
      const link = document.createElement("a");
      link.href = match[3]?.startsWith("/") ? appHref(match[3]) : (match[3] ?? "#");
      link.textContent = match[2] ?? match[3] ?? "link";
      if (link.href.startsWith("http")) {
        link.target = "_blank";
        link.rel = "noreferrer";
      }
      container.append(link);
    }
    cursor = index + match[0].length;
  }
  container.append(document.createTextNode(value.slice(cursor)));
}
