import "./styles/global.css";

import { createRoot } from "react-dom/client";
import { createElement } from "react";

import { handlers } from "@modulus/types";

async function enableMocking(): Promise<void> {
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

async function mount(): Promise<void> {
  await enableMocking();

  const { default: App } = await import("./App");
  const root = document.getElementById("root");

  if (!root) {
    throw new Error("Root element #root not found in document");
  }

  createRoot(root).render(createElement(App));
}

void mount();


