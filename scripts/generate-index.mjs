import { readdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

const clientDir = join(process.cwd(), "dist", "client");
const assetsDir = join(clientDir, "assets");

// Read actual built asset filenames
const assets = readdirSync(assetsDir);
const cssFile  = assets.find((f) => f.endsWith(".css") && !f.includes("purify"));
const mainJs   = assets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const jspdfJs  = assets.find((f) => f.startsWith("index.es-") && f.endsWith(".js"));
const purifyJs = assets.find((f) => f.startsWith("purify") && f.endsWith(".js"));
const html2Js  = assets.find((f) => f.startsWith("html2canvas") && f.endsWith(".js"));

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agrozaar Foods LLP — ERP</title>
    <meta name="description" content="Agrozaar Foods LLP — Premium Spice Manufacturing ERP" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" />
    ${cssFile  ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
    ${purifyJs ? `<script type="module" src="/assets/${purifyJs}"></script>` : ""}
    ${html2Js  ? `<script type="module" src="/assets/${html2Js}"></script>` : ""}
    ${jspdfJs  ? `<script type="module" src="/assets/${jspdfJs}"></script>` : ""}
  </head>
  <body>
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="/assets/${mainJs}"></script>` : ""}
  </body>
</html>`;

writeFileSync(join(clientDir, "index.html"), html);
console.log("✅  Generated dist/client/index.html");
console.log("   CSS  :", cssFile);
console.log("   Main :", mainJs);
