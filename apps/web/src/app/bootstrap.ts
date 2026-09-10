import { createLayout } from "./layout";
import { getPreferredLanguage } from "./preferences.store";
import { dispatch, installRouter } from "./router";

export function bootstrap(): void {
  const root = document.querySelector<HTMLElement>("#app");
  if (!root) throw new Error("Missing #app root");

  const initialLanguage = getPreferredLanguage();
  document.documentElement.lang = initialLanguage;

  const layout = createLayout(root, initialLanguage);

  installRouter(layout);
  void dispatch(new URL(window.location.href), layout);
}
