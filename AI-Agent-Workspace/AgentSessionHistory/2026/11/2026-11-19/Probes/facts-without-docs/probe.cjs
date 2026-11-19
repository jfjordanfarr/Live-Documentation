// Probe of November 19, 2026 (not product code): the graph made straight from the generator's in-memory models,
// never written as Markdown, held against the graph derived from the docs it writes.
//
// Usage: node probe.cjs <workspace> <mode> <out.json>
//   mode "analysis": a dry run in which the renderer and the post-render read are replaced by a recorder, so nothing is
//                    rendered, parsed or written; the graph is derived from the recorded models. Times the analysis alone.
//   mode "full":     the generator as it is (renders, reads back, writes every doc and index.json), with the models
//                    recorded on the way; then compares the models' graph with index.json field by field.
// Run from the worktree so that `@live-documentation/*` resolves to its built packages.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const documentModule = require("@live-documentation/engine/live-docs/document");
const graphModule = require("@live-documentation/engine/live-docs/graph");
const configModule = require("@live-documentation/engine/config/liveDocumentationConfig");

const [workspaceArg, mode, outPath] = process.argv.slice(2);
const workspace = path.resolve(workspaceArg);
const configFile = path.join(workspace, ".live-docs.config.json");
const configInput = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : undefined;
const config = configModule.normalizeLiveDocumentationConfig(configInput);

const SENTINEL = "\u0000probe-unrendered\u0000";
const models = new Map();
const realRender = documentModule.renderLiveDoc;
const realParse = documentModule.parseLiveDoc;
documentModule.renderLiveDoc = (doc) => {
  models.set(doc.codePath, doc);
  return mode === "analysis" ? SENTINEL : realRender(doc);
};
documentModule.parseLiveDoc = (text) => (text === SENTINEL ? { stub: true } : realParse(text));

const { generateLiveDocs } = require("@live-documentation/generator");

function docPathOf(codePath) {
  return path.posix.join(config.root.replace(/\\/g, "/"), config.baseLayer.replace(/\\/g, "/"), `${codePath}${config.extension}`);
}

function deriveFromModels() {
  return graphModule.deriveLiveDocGraph([...models.values()].map((doc) => ({ docPath: docPathOf(doc.codePath), doc })), config);
}

// ---------------------------------------------------------------------------------------------------------------
// Field-by-field comparison.
// ---------------------------------------------------------------------------------------------------------------
function diff(a, b, at, out) {
  if (a === b) return;
  const ta = Array.isArray(a) ? "array" : a === null ? "null" : typeof a;
  const tb = Array.isArray(b) ? "array" : b === null ? "null" : typeof b;
  if (ta !== tb || (ta !== "object" && ta !== "array")) {
    out.push({ at, model: a, docs: b });
    return;
  }
  if (ta === "array") {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i += 1) diff(a[i], b[i], `${at}[${i}]`, out);
    return;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) diff(a[key], b[key], `${at}.${key}`, out);
}

function pattern(at) {
  return at.replace(/\[\d+\]/g, "[]");
}

function compare(modelGraph, docsGraph) {
  const modelFiles = modelGraph.files;
  const docsFiles = docsGraph.files;
  const onlyModel = Object.keys(modelFiles).filter((k) => !(k in docsFiles));
  const onlyDocs = Object.keys(docsFiles).filter((k) => !(k in modelFiles));
  const differences = [];
  for (const codePath of Object.keys(modelFiles)) {
    if (!(codePath in docsFiles)) continue;
    const found = [];
    diff(modelFiles[codePath], docsFiles[codePath], "", found);
    for (const d of found) differences.push({ codePath, ...d });
  }
  const top = [];
  for (const key of ["root", "baseLayer", "extension"]) if (modelGraph[key] !== docsGraph[key]) top.push(key);
  const byPattern = {};
  const filesByPattern = {};
  for (const d of differences) {
    const p = pattern(d.at);
    (byPattern[p] ??= []).push(d);
    (filesByPattern[p] ??= new Set()).add(d.codePath);
  }
  const summary = Object.entries(byPattern)
    .map(([p, list]) => ({ field: p, count: list.length, files: filesByPattern[p].size, samples: list.slice(0, 3) }))
    .sort((x, y) => y.count - x.count);
  const filesDiffering = new Set(differences.map((d) => d.codePath)).size;
  return {
    filesInModelGraph: Object.keys(modelFiles).length,
    filesInDocsGraph: Object.keys(docsFiles).length,
    onlyInModelGraph: onlyModel,
    onlyInDocsGraph: onlyDocs,
    topLevelDifferences: top,
    filesIdentical: Object.keys(modelFiles).length - onlyModel.length - filesDiffering,
    filesDiffering,
    differences: differences.length,
    byField: summary
  };
}

function walkDocs(root) {
  let count = 0;
  let bytes = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.isFile() && e.name.endsWith(config.extension)) { count += 1; bytes += fs.statSync(p).size; }
    }
  }
  return { count, bytes };
}

(async () => {
  const quiet = { info: () => {}, warn: (m) => warnings.push(m), error: (m) => warnings.push(m) };
  const warnings = [];
  const started = process.hrtime.bigint();
  const cpuStart = process.cpuUsage();
  const result = await generateLiveDocs({
    workspaceRoot: workspace,
    config: configInput,
    dryRun: mode === "analysis",
    logger: quiet,
    now: () => new Date("2026-11-19T00:00:00.000Z")
  });
  const generateSeconds = Number(process.hrtime.bigint() - started) / 1e9;
  const cpu = process.cpuUsage(cpuStart);
  const rssAfterGenerate = process.resourceUsage().maxRSS;
  const deriveStart = process.hrtime.bigint();
  const modelGraph = deriveFromModels();
  const deriveSeconds = Number(process.hrtime.bigint() - deriveStart) / 1e9;
  const out = {
    workspace,
    mode,
    generateSeconds,
    processorSeconds: (cpu.user + cpu.system) / 1e6,
    peakRssMbAfterGenerate: Math.round(rssAfterGenerate / 1024),
    deriveFromModelsSeconds: deriveSeconds,
    processed: result.processed,
    written: result.written,
    skipped: result.skipped,
    failed: result.failed.map((f) => ({ sourcePath: f.sourcePath, reason: f.reason.slice(0, 300) })),
    modelsRecorded: models.size,
    warnings: warnings.slice(0, 20)
  };
  if (mode === "full") {
    const indexPath = path.join(workspace, config.root, config.baseLayer, graphModule.GRAPH_INDEX_FILE);
    const indexText = fs.readFileSync(path.join(workspace, result.index));
    const docsGraph = JSON.parse(indexText.toString("utf8"));
    // The model graph as index.json would hold it: through JSON, so that an absent optional and an undefined one agree.
    const modelJson = JSON.stringify(modelGraph);
    out.indexFile = result.index;
    out.indexBytes = indexText.length;
    out.indexGzipBytes = require("node:zlib").gzipSync(indexText, { level: 9 }).length;
    out.modelGraphJsonBytes = Buffer.byteLength(modelJson);
    out.docs = walkDocs(path.join(workspace, config.root, config.baseLayer));
    out.comparison = compare(JSON.parse(modelJson), docsGraph);
    // The comparison can fail: one symbol renamed, one edge dropped and one file removed must be found.
    const mutated = JSON.parse(modelJson);
    const withSymbol = Object.values(mutated.files).find((f) => f.symbols.length > 0);
    const withEdge = Object.values(mutated.files).find((f) => f.edges.length > 0);
    if (withSymbol) withSymbol.symbols[0].name += " (mutated)";
    if (withEdge) withEdge.edges.pop();
    delete mutated.files[Object.keys(mutated.files)[0]];
    const selfTest = compare(mutated, docsGraph);
    out.selfTest = { differences: selfTest.differences, onlyInDocsGraph: selfTest.onlyInDocsGraph.length, fields: selfTest.byField.map((b) => b.field) };
    void indexPath;
  }
  out.peakRssMbAtEnd = Math.round(process.resourceUsage().maxRSS / 1024);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  const c = out.comparison;
  console.log(`${mode} ${path.basename(workspace)}: ${generateSeconds.toFixed(1)} s wall, ${out.processorSeconds.toFixed(1)} s cpu, ${out.peakRssMbAfterGenerate} MB peak; models ${models.size}; failed ${result.failed.length}` +
    (c ? `; graph files model ${c.filesInModelGraph} docs ${c.filesInDocsGraph}; identical ${c.filesIdentical}, differing ${c.filesDiffering}, differences ${c.differences}` : ""));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
