#!/usr/bin/env node
// Builds the trial page of what a scan leaves out into one HTML file: `page.mjs` with `model.mjs` and the engine's
// `leaveOut`, bundled by esbuild into one inline script admitted by its hash, under the page's kind of policy (no
// network, nothing else run). Opened from disk; nothing leaves the machine.
//   node build.mjs            writes choice.html beside this file
import { build } from "esbuild";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const script = (await build({ entryPoints: [path.join(here, "page.mjs")], bundle: true, write: false, format: "iife", platform: "browser", target: "es2022", minify: true, logLevel: "silent", loader: { ".txt": "text" } })).outputFiles[0].text;
const hash = createHash("sha256").update(script).digest("base64");
const policy = `default-src 'none'; script-src 'sha256-${hash}'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`;
const html = fs.readFileSync(path.join(here, "page.html"), "utf8").replace("POLICY", policy).replace("<script></script>", () => `<script>${script}</script>`);
fs.writeFileSync(path.join(here, "choice.html"), html);
console.log(`Wrote choice.html (${Math.round(html.length / 1024)} KB)`);
