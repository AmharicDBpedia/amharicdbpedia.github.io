import { appHref } from "../app/paths";
import { text } from "../dom/html";
import { failureInfo } from "../services/endpoint-error";
import "./recovery.css";

export function renderEndpointError(
  error: unknown,
  onRetry: () => void | Promise<void>,
  context: string,
): HTMLElement {
  const info = failureInfo(error, !navigator.onLine);
  const panel = document.createElement("section");
  panel.className = "recovery-panel";
  panel.setAttribute("role", "alert");
  const symbol = text("span", "!");
  symbol.className = "recovery-panel__symbol";
  symbol.setAttribute("aria-hidden", "true");
  const content = document.createElement("div");
  const eyebrow = text("p", context);
  eyebrow.className = "recovery-panel__eyebrow";
  const title = text("h2", info.title);
  const description = text("p", info.description);
  const actions = document.createElement("div");
  actions.className = "recovery-panel__actions";
  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Retry loading";
  retry.onclick = async () => {
    retry.disabled = true;
    retry.textContent = "Retrying...";
    try {
      await onRetry();
    } finally {
      retry.disabled = false;
      retry.textContent = "Retry loading";
    }
  };
  const datasets = document.createElement("a");
  datasets.href = appHref("/tools#datasets");
  datasets.textContent = "Browse published datasets";
  actions.append(retry, datasets);
  const details = document.createElement("details");
  details.append(text("summary", "Technical details"), text("code", info.code));
  content.append(eyebrow, title, description, actions, details);
  panel.append(symbol, content);
  return panel;
}
