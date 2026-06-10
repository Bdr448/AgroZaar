// ─── DEV LOGGER ────────────────────────────────────────────────────────────
// All logs are prefixed with [AZ] and only print in development / preview.
// Open browser DevTools → Console to see everything.

const IS_DEV = import.meta.env.DEV || import.meta.env.MODE === "production"; // always on so you can debug preview build too

const COLORS = {
  info:    "color:#4ade80;font-weight:bold",   // green
  warn:    "color:#facc15;font-weight:bold",   // yellow
  error:   "color:#f87171;font-weight:bold",   // red
  event:   "color:#60a5fa;font-weight:bold",   // blue
  network: "color:#c084fc;font-weight:bold",   // purple
  ui:      "color:#fb923c;font-weight:bold",   // orange
};

function ts() {
  return new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
}

export const log = {
  info(tag: string, msg: string, data?: unknown) {
    if (!IS_DEV) return;
    data !== undefined
      ? console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.info, data)
      : console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.info);
  },

  warn(tag: string, msg: string, data?: unknown) {
    if (!IS_DEV) return;
    data !== undefined
      ? console.warn(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.warn, data)
      : console.warn(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.warn);
  },

  error(tag: string, msg: string, err?: unknown) {
    if (!IS_DEV) return;
    console.error(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.error, err ?? "");
  },

  event(tag: string, msg: string, data?: unknown) {
    if (!IS_DEV) return;
    data !== undefined
      ? console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.event, data)
      : console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.event);
  },

  network(tag: string, msg: string, data?: unknown) {
    if (!IS_DEV) return;
    data !== undefined
      ? console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.network, data)
      : console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.network);
  },

  ui(tag: string, msg: string, data?: unknown) {
    if (!IS_DEV) return;
    data !== undefined
      ? console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.ui, data)
      : console.log(`%c[AZ ${ts()}][${tag}] ${msg}`, COLORS.ui);
  },

  group(label: string) {
    if (!IS_DEV) return;
    console.group(`%c[AZ ${ts()}] ▶ ${label}`, "color:#94a3b8;font-weight:bold");
  },

  groupEnd() {
    if (!IS_DEV) return;
    console.groupEnd();
  },

  time(label: string): () => void {
    if (!IS_DEV) return () => {};
    const start = performance.now();
    return () => {
      const ms = (performance.now() - start).toFixed(1);
      console.log(`%c[AZ ${ts()}][PERF] ${label} took ${ms}ms`, "color:#94a3b8");
    };
  },
};

// ─── Global click / focus spy ──────────────────────────────────────────────
// Logs every click and every input focus so you can see exactly what freezes.
if (IS_DEV && typeof window !== "undefined") {
  window.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    log.ui("DOM", `CLICK on <${el.tagName.toLowerCase()}> id="${el.id}" class="${el.className.toString().slice(0, 60)}"`);
  }, true);

  window.addEventListener("focusin", (e) => {
    const el = e.target as HTMLElement;
    const name = (el as HTMLInputElement).name || el.id || el.tagName;
    log.ui("DOM", `FOCUS → ${name}`);
  }, true);

  window.addEventListener("focusout", (e) => {
    const el = e.target as HTMLElement;
    const name = (el as HTMLInputElement).name || el.id || el.tagName;
    log.ui("DOM", `BLUR  ← ${name}`);
  }, true);

  // Detect long JS tasks that freeze the UI (>50ms = jank)
  if ("PerformanceObserver" in window) {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            log.warn("PERF", `Long task detected: ${entry.duration.toFixed(1)}ms — this can freeze input`, entry);
          }
        }
      });
      obs.observe({ type: "longtask", buffered: true });
    } catch {
      // longtask not supported in all browsers
    }
  }

  log.info("INIT", "🪵 AgroZaar dev logger active — all clicks, focus, auth & network calls will be logged here");
}
