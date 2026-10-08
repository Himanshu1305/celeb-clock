import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/fonts.css";
import "./index.css";
import "./i18n";
import { applyCurrencyOverrideFromUrl } from "@/lib/pricing";

// Honour ?currency=USD|INR before first paint — forces display + checkout
// currency for the session (persisted in sessionStorage). Testing/admin aid.
applyCurrencyOverrideFromUrl();

createRoot(document.getElementById("root")!).render(<App />);

// Installable PWA (P3): register the service worker in built (non-dev) environments only,
// so vite dev HMR is never intercepted. The SW is network-first for HTML (no stale-shell
// hazard) and offline-capable via /offline.html. See public/sw.js.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.debug("[pwa] service worker registration failed:", err);
    });
  });
}
