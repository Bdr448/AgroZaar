import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initAuthListener } from "@/lib/erp/auth";
import { log } from "@/lib/logger";
import "./styles.css";

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED INPUT MONITORING — Track every interaction with precise timing
// ═══════════════════════════════════════════════════════════════════════════
if (typeof window !== "undefined") {
  let lastInteractionTime = 0;
  let interactionCounter = 0;

  ["mousedown", "mouseup", "click", "touchstart", "touchend", "keydown", "keyup", "input", "focus", "blur"].forEach((eventType) => {
    window.addEventListener(eventType, (e) => {
      const now = performance.now();
      const timeSinceLastInteraction = lastInteractionTime ? now - lastInteractionTime : 0;
      lastInteractionTime = now;
      interactionCounter++;

      const target = e.target as HTMLElement;
      const tagName = target.tagName?.toLowerCase() || "unknown";
      const inputType = (target as HTMLInputElement).type || "";
      const inputName = (target as HTMLInputElement).name || target.id || "";

      const color = timeSinceLastInteraction > 100 ? "color:red;font-weight:bold;font-size:13px" : 
                    timeSinceLastInteraction > 50 ? "color:orange;font-size:12px" : 
                    "color:green;font-size:11px";

      console.log(
        `%c[INPUT #${interactionCounter}] ${eventType.toUpperCase()} on <${tagName}${inputType ? ` type="${inputType}"` : ""}${inputName ? ` name="${inputName}"` : ""}> — gap: ${timeSinceLastInteraction.toFixed(1)}ms`,
        color
      );

      if (timeSinceLastInteraction > 100) {
        console.error(
          `🔴 FREEZE DETECTED: ${timeSinceLastInteraction.toFixed(0)}ms gap between ${eventType} events — UI thread was blocked!`
        );
      }
    }, true);
  });

  console.log("%c🔍 INPUT MONITOR ACTIVE — Watch for RED logs above 100ms", "background:#000;color:#0f0;padding:4px;font-weight:bold");
}

// Initialize auth listener at app startup — NOT on login submit
if (typeof window !== "undefined") {
  log.info("APP", "Starting auth listener at app init");
  initAuthListener();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreloadStaleTime: 0,
  defaultPreload: "intent", // Preload routes on hover/focus
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (root) {
  // Preload critical routes immediately
  router.preloadRoute({ to: "/login" }).catch(() => {});
  router.preloadRoute({ to: "/app/dashboard" }).catch(() => {});
  
  ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
}
