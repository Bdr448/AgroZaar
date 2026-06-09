import { existsSync } from "fs";
import { join } from "path";

const indexPath = join(process.cwd(), "dist", "client", "index.html");

if (existsSync(indexPath)) {
  console.log("✅  dist/client/index.html exists — SPA build ready for Vercel.");
} else {
  console.error("❌  dist/client/index.html NOT found — build may have failed.");
  process.exit(1);
}
