import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applyCurrencyOverrideFromUrl } from "@/lib/pricing";

// Honour ?currency=USD|INR before first paint — forces display + checkout
// currency for the session (persisted in sessionStorage). Testing/admin aid.
applyCurrencyOverrideFromUrl();

createRoot(document.getElementById("root")!).render(<App />);
