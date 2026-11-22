// Probe of 2026-11-22 (not product code), the stored form's review: the end line written other ways, a file named
// `__proto__` in the graph, a dependency with no link, and which paths, links and locations the module stores. From
// the repository's root:
//   node <this folder>/forms.mjs $PWD/packages/stored-form/src/storedForm.ts
const M = await import(process.argv[2]);
const head = { location: { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" }, scanner: "s", leftOut: [] };
const file = (codePath, more = {}) => ({ codePath, layer: 4, entries: [], authored: "", symbols: [], dependencies: [], ...more });
const scan = { head, files: [file("a"), file("b")] };
const text = M.textOfScan(scan);
console.log("the text's end line:", JSON.stringify(text.split("\n").at(-2)));
for (const end of ['[null, "end", 2]', '[null,"end",2.0]', '[null,"end",2e0]', '[null,"\\u0065nd",2]', '[null,"end",2]\r', ' [null,"end",2]\t']) {
  const variant = text.replace('[null,"end",2]', end);
  const r = M.scanOfText(variant);
  const again = r.ok ? M.textOfScan(r.value) : "";
  console.log(`end written ${JSON.stringify(end)}: ${r.ok ? "accepted" : "refused " + r.reason}${r.ok ? `, written again ${again === variant ? "the same" : "differently"}` : ""}`);
}

// A file named __proto__.
const proto = { head, files: [file("__proto__", { dependencies: [{ label: "a", link: "a.mdmd.md", target: "a", qualifiers: [] }] }), file("a")] };
const w = await M.writeScan(proto);
const read = await M.readScan(w.value);
const graph = M.graphOf(read.value);
const view = M.graphViewOf(read.value);
console.log("__proto__ read:", read.ok, "view has it:", view.file("__proto__")?.codePath, "graphOf keys:", Object.keys(graph.files), "JSON keys:", Object.keys(JSON.parse(JSON.stringify(graph)).files), 'graph.files["edges"]:', JSON.stringify(graph.files["edges"]), "a's inbound:", graph.files.a.inbound);

// A dependency with no link: does it make an edge?
const g2 = M.graphOf({ head, files: [file("a", { dependencies: [{ label: "node:fs", qualifiers: [] }] })] });
console.log("edges of a dependency with no link:", JSON.stringify(g2.files.a.edges));

// Paths and links the module accepts.
const tryPath = async (p) => (await M.writeScan({ head, files: [file(p)] })).ok;
for (const p of ["a\\..\\..\\..\\x", "CON", "aux.txt", "src/a:b.txt", "dir./x", "dir /x", "x.", "...", ".. /x", "a/\u0085", "‮gnp.exe", "a\u0000"]) console.log(`path ${JSON.stringify(p)}: ${(await tryPath(p)) ? "stored" : "refused"}`);
const tryLink = async (link) => (await M.writeScan({ head, files: [file("a", { dependencies: [{ label: "x", link, qualifiers: [] }] })] })).ok;
for (const l of ["https://example.com/x", "javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "//server/share", "\\\\server\\share", "FILE:x", "../../../../../../etc/passwd", "a\u0000b", ""]) console.log(`link ${JSON.stringify(l)}: ${(await tryLink(l)) ? "stored" : "refused"}`);
// A location whose document paths are the code paths.
const plain = { head: { location: { root: "", baseLayer: "", extension: "" }, scanner: "s", leftOut: [] }, files: [file("src/a.ts")] };
const w3 = await M.writeScan(plain);
console.log("empty location stored:", w3.ok, "doc path of src/a.ts:", M.docPathOf(plain.head.location, "src/a.ts"));
const ads = { root: "", baseLayer: "", extension: ":x" };
console.log("extension ':x' stored:", (await M.writeScan({ head: { location: ads, scanner: "s", leftOut: [] }, files: [file("src/a.ts")] })).ok, "doc path:", M.docPathOf(ads, "src/a.ts"));
