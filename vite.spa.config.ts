import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const srcRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  root: projectRoot,
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — tiny, needed immediately
          "vendor-react": ["react", "react-dom"],

          // Supabase — needed for auth on login
          "vendor-supabase": ["@supabase/supabase-js"],

          // Query — needed for data fetching
          "vendor-query": ["@tanstack/react-query"],

          // Heavy chart/PDF libs — only used inside ERP pages, NOT login
          "vendor-charts": ["recharts"],
          "vendor-pdf": ["jspdf", "jspdf-autotable", "html2canvas"],

          // All Radix UI components bundled together
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-menubar",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-aspect-ratio",
          ],

          // Lucide icons — huge, only needed in ERP
          "vendor-icons": ["lucide-react"],

          // Misc UI utilities
          "vendor-ui": [
            "sonner",
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "cmdk",
            "vaul",
            "embla-carousel-react",
            "react-resizable-panels",
            "react-day-picker",
            "input-otp",
            "date-fns",
            "zod",
            "react-hook-form",
            "@hookform/resolvers",
          ],
        },
      },
    },
  },
  preview: {
    allowedHosts: ["agrozaar.onrender.com", ".onrender.com"],
    port: 10000,
    host: true,
  },
  server: {
    allowedHosts: ["agrozaar.onrender.com", ".onrender.com"],
    port: 10000,
    host: true,
  },
  resolve: {
    alias: {
      "@": srcRoot,
    },
  },
});
