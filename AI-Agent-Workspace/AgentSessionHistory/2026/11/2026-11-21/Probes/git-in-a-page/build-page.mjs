// Probe of November 21, 2026 (not product code): writes `probe.html`, one self-contained file, from the reader, the
// inflate, the workload and the page's own part, the same modules the Node runs import, with their import and export
// words taken out. Its policy lets in that one script by its hash and nothing from any network.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const modules = ["inflate.mjs", "git-reader.mjs", "workload.mjs", "page-main.mjs"];
const script = modules
  .map((name) =>
    fs
      .readFileSync(path.join(here, name), "utf8")
      .replace(/^import .*$/gmu, "")
      .replace(/^export /gmu, "")
  )
  .join("\n");
const hash = createHash("sha256").update(script).digest("base64");
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'; style-src 'unsafe-inline'">
<title>Git in a page</title>
<style>
  :root { color-scheme: light dark; --ink: #1d1d1f; --paper: #fbfbfd; --line: #c7c7cc; }
  @media (prefers-color-scheme: dark) { :root { --ink: #f2f2f7; --paper: #1c1c1e; --line: #48484a; } }
  body { font: 16px/1.5 system-ui, sans-serif; color: var(--ink); background: var(--paper); margin: 0 auto; max-width: 46rem; padding: 1rem; }
  #drop { border: 2px dashed var(--line); border-radius: 8px; padding: 1.5rem; text-align: center; margin: 1rem 0; }
  p { overflow-wrap: anywhere; }
</style>
</head>
<body>
<h1>Git in a page</h1>
<p>Give this page a folder that holds a repository. It reads only what you give it, and nothing leaves the machine.</p>
<p><label>Choose a folder: <input type="file" id="folder" webkitdirectory></label></p>
<p><button id="pick" type="button">Pick a folder (File System Access)</button></p>
<div id="drop">Or drop a folder here</div>
<p id="verdict" aria-live="polite">No folder yet.</p>
<p><button id="read" type="button" disabled>Read the history</button></p>
<p id="progress" aria-live="polite"></p>
<script type="module">${script}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(here, "probe.html"), html);
console.log(`probe.html: ${html.length} bytes, script ${script.length} bytes`);
