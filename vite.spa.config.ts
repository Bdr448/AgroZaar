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
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
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
