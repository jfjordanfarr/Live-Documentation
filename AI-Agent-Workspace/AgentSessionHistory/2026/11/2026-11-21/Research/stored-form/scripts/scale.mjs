// Research of November 21, 2026 (not product code). A scan five times DNN's size, made from DNN's facts, so that each
// design's growth can be measured above the largest real corpus at hand.
//
// It is not a real repository. It is DNN's 10,776 files repeated under five folders (`copy-1/` to `copy-5/`), every
// path a file names (its own, its edges' targets, its inbound and outbound lists) moved into its own copy, so each copy
// is wired only inside itself. The links as written (doc-relative) and the docstrings are unchanged, so the strings
// repeat across copies more than five real solutions' would: a flattering case for every design that interns strings,
// and said wherever its numbers are used.
//
//   node scale.mjs <graph.json> <copies> <out.json>
//   node scale.mjs --ndjson <graph.json> <out.ndjson>     the same facts as one line per file, [path, record, outbound],
//                                                         in path order: what a sink would be handed file by file
import fs from "node:fs";
import { comparePaths, recordOf } from "./designs/common.mjs";

const args = process.argv.slice(2);
if (args[0] === "--ndjson") {
  const graph = JSON.parse(fs.readFileSync(args[1], "utf8"));
  const fd = fs.openSync(args[2], "w");
  fs.writeSync(fd, `${JSON.stringify({ root: graph.root, baseLayer: graph.baseLayer, extension: graph.extension, files: Object.keys(graph.files).length })}\n`);
  for (const p of Object.keys(graph.files).sort(comparePaths)) fs.writeSync(fd, `${JSON.stringify([p, recordOf(graph.files[p]), graph.files[p].outbound])}\n`);
  fs.closeSync(fd);
} else {
  const [input, copiesText, output] = args;
  const graph = JSON.parse(fs.readFileSync(input, "utf8"));
  const copies = Number(copiesText);
  const fd = fs.openSync(output, "w");
  fs.writeSync(fd, `{"root":${JSON.stringify(graph.root)},"baseLayer":${JSON.stringify(graph.baseLayer)},"extension":${JSON.stringify(graph.extension)},"files":{`);
  let first = true;
  for (let k = 1; k <= copies; k += 1) {
    const prefix = `copy-${k}/`;
    const move = (p) => prefix + p;
    for (const p of Object.keys(graph.files)) {
      const f = graph.files[p];
      const docBase = f.docPath.slice(0, f.docPath.length - (p.length + graph.extension.length));
      const moved = { ...f, codePath: move(p), docPath: `${docBase}${move(p)}${graph.extension}`, edges: f.edges.map((e) => (e.to === undefined ? e : { ...e, to: move(e.to) })), outbound: f.outbound.map(move), inbound: f.inbound.map(move) };
      fs.writeSync(fd, `${first ? "" : ","}${JSON.stringify(move(p))}:${JSON.stringify(moved)}`);
      first = false;
    }
  }
  fs.writeSync(fd, "}}");
  fs.closeSync(fd);
}
