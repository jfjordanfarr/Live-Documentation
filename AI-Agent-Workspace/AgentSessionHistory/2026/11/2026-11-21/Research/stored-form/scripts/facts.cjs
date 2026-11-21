// Research of November 21, 2026 (not product code): a scan's facts, made straight from the generator's models and
// written as one compact JSON file, so that every stored form measured beside it starts from the same facts.
//
// It is the "analysis" mode of the probe of November 19 (../../../../2026-11-19/Probes/facts-without-docs/probe.cjs):
// the renderer is replaced by a recorder, nothing is rendered or written into the workspace, and the graph is derived
// from the recorded models with the engine's own `deriveLiveDocGraph`. That probe showed this graph equal, field by
// field, to the graph read back from the written docs on 14,336 files.
//
// Usage, from the repository root after `npm run build`:
//   node <this file> <workspace> <out.json>
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const documentModule = require("@live-documentation/engine/live-docs/document");
const graphModule = require("@live-documentation/engine/live-docs/graph");
const configModule = require("@live-documentation/engine/config/liveDocumentationConfig");

const [workspaceArg, outPath] = process.argv.slice(2);
if (!workspaceArg || !outPath) {
  console.error("usage: node facts.cjs <workspace> <out.json>");
  process.exit(2);
}
const workspace = path.resolve(workspaceArg);
const configFile = path.join(workspace, ".live-docs.config.json");
const configInput = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : undefined;
const config = configModule.normalizeLiveDocumentationConfig(configInput);

const SENTINEL = "\u0000research-unrendered\u0000";
const models = new Map();
const realParse = documentModule.parseLiveDoc;
documentModule.renderLiveDoc = (doc) => {
  models.set(doc.codePath, doc);
  return SENTINEL;
};
documentModule.parseLiveDoc = (text) => (text === SENTINEL ? { stub: true } : realParse(text));

const { generateLiveDocs } = require("@live-documentation/generator");

function docPathOf(codePath) {
  return path.posix.join(config.root.replace(/\\/g, "/"), config.baseLayer.replace(/\\/g, "/"), `${codePath}${config.extension}`);
}

(async () => {
  const quiet = { info: () => {}, warn: () => {}, error: () => {} };
  const started = process.hrtime.bigint();
  const result = await generateLiveDocs({
    workspaceRoot: workspace,
    config: configInput,
    dryRun: true,
    logger: quiet,
    now: () => new Date("2026-11-21T00:00:00.000Z")
  });
  const seconds = Number(process.hrtime.bigint() - started) / 1e9;
  const graph = graphModule.deriveLiveDocGraph([...models.values()].map((doc) => ({ docPath: docPathOf(doc.codePath), doc })), config);
  const text = JSON.stringify(graph);
  fs.writeFileSync(outPath, text);
  console.log(JSON.stringify({ workspace: path.basename(workspace), seconds: Math.round(seconds), files: Object.keys(graph.files).length, failed: result.failed.length, bytes: Buffer.byteLength(text), peakMb: Math.round(process.resourceUsage().maxRSS / 1024) }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
