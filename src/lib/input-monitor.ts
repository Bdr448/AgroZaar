// Performance monitoring for input responsiveness — ALWAYS ON
if (typeof window !== "undefined") {
  let lastInteraction = 0;
  let interactionCount = 0;

  // Track ALL input events with precise timing
  ["mousedown", "mouseup", "click", "keydown", "keyup", "input", "focus", "blur"].forEach(
    (eventType) => {
      window.addEventListener(
        eventType,
        (e) => {
          const now = performance.now();
          const gap = lastInteraction ? now - lastInteraction : 0;
          lastInteraction = now;
          interactionCount++;

          const target = e.target as HTMLElement;
          const tagName = target.tagName?.toLowerCase() || "unknown";
          const type = (target as HTMLInputElement).type || "";
          const name = (target as HTMLInputElement).name || target.id || "";

          console.log(
            `%c[INPUT ${interactionCount}] ${eventType.toUpperCase()} on <${tagName}${type ? ` type="${type}"` : ""}${name ? ` name="${name}"` : ""}> — gap: ${gap.toFixed(1)}ms`,
            gap > 100 ? "color:red;font-weight:bold" : gap > 50 ? "color:orange" : "color:green",
          );

          // Warn if there's a significant gap
          if (gap > 100) {
            console.warn(
              `⚠️ INPUT LAG DETECTED: ${gap.toFixed(1)}ms between interactions — this indicates UI thread blocking`,
            );
          }
        },
        true,
      );
    },
  );

  // Monitor style recalculations
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "measure") {
        console.log(`%c[PERF] ${entry.name}: ${entry.duration.toFixed(2)}ms`, "color:purple");
      }
    }
  });
  observer.observe({ entryTypes: ["measure"] });

  // Monitor frame drops
  let lastFrame = performance.now();
  let frameCount = 0;
  function checkFrame() {
    const now = performance.now();
    const delta = now - lastFrame;
    lastFrame = now;
    frameCount++;

    // 60fps = 16.67ms per frame, 30fps = 33.33ms
    if (delta > 50) {
      console.warn(
        `%c[FRAME DROP] Frame ${frameCount} took ${delta.toFixed(1)}ms (should be <16.7ms for 60fps)`,
        "color:red;font-weight:bold",
      );
    }

    requestAnimationFrame(checkFrame);
  }
  requestAnimationFrame(checkFrame);

  console.log(
    "%c🔍 Advanced input monitoring active — watch for red warnings above 100ms gaps",
    "color:cyan;font-weight:bold;font-size:14px",
  );
}

export {};
