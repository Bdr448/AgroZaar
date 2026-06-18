import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimpleRouter, useRouter } from "./lib/simple-router.jsx";
import { initAuthListener } from "@/lib/erp/auth";
import { log } from "@/lib/logger";
import "./styles.css";

import { Suspense, lazy } from "react";

// Pages
import HomePage from "./pages/Home.jsx";
import LoginPage from "./pages/Login.jsx";
import AppLayout from "./pages/App.jsx";

const ForgotPasswordPage = lazy(() => import("./routes/forgot-password.tsx"));
const ResetPasswordPage = lazy(() => import("./routes/reset-password.tsx"));
const SessionExpiredPage = lazy(() => import("./routes/session-expired.tsx"));
const UnauthorizedPage = lazy(() => import("./routes/unauthorized.tsx"));

// Initialize auth
if (typeof window !== "undefined") {
  log.info("APP", "Starting auth listener at app init");
  initAuthListener();

  // Advanced input monitoring
  let lastInteractionTime = 0;
  let interactionCounter = 0;

  ["mousedown", "mouseup", "click", "keydown", "focus", "blur"].forEach((eventType) => {
    window.addEventListener(eventType, (e) => {
      const now = performance.now();
      const gap = lastInteractionTime ? now - lastInteractionTime : 0;
      lastInteractionTime = now;
      interactionCounter++;

      const target = e.target;
      const tag = target.tagName?.toLowerCase() || "unknown";
      const type = target.type || "";
      const name = target.name || target.id || "";

      const color = gap > 100 ? "color:red;font-weight:bold" : gap > 50 ? "color:orange" : "color:green";

      console.log(
        `%c[INPUT #${interactionCounter}] ${eventType.toUpperCase()} on <${tag}${type ? ` type="${type}"` : ""}${name ? ` name="${name}"` : ""}> — gap: ${gap.toFixed(1)}ms`,
        color
      );

      if (gap > 100) {
        console.error(`🔴 FREEZE: ${gap.toFixed(0)}ms gap — UI thread blocked!`);
      }
    }, true);
  });

  console.log("%c🔍 INPUT MONITOR ACTIVE", "background:#000;color:#0f0;padding:4px;font-weight:bold");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function App() {
  const { route } = useRouter();
  
  const Loading = () => (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  // Route matching — normalize by removing leading slash to support both slashed and non-slashed hashes (e.g. #/login vs #login)
  const cleanRoute = route.replace(/^\//, "");
  
  if (cleanRoute === "login") return <LoginPage />;
  if (cleanRoute === "app" || cleanRoute.startsWith("app/")) return <AppLayout />;
  if (cleanRoute === "forgot-password") return <Suspense fallback={<Loading />}><ForgotPasswordPage /></Suspense>;
  if (cleanRoute === "reset-password") return <Suspense fallback={<Loading />}><ResetPasswordPage /></Suspense>;
  if (cleanRoute === "session-expired") return <Suspense fallback={<Loading />}><SessionExpiredPage /></Suspense>;
  if (cleanRoute === "unauthorized") return <Suspense fallback={<Loading />}><UnauthorizedPage /></Suspense>;

  // Any other route (including empty, root, or section anchors like "products", "/products", "about") renders HomePage
  return <HomePage />;
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <SimpleRouter>
        <App />
      </SimpleRouter>
    </QueryClientProvider>
  );
}
