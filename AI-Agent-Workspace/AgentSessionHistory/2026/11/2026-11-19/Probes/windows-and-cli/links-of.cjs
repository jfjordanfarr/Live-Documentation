// Prints, for each file of a generated workspace, its dependency lines and whether each names a file the graph holds.
const fs = require("node:fs");
const path = require("node:path");

const workspace = process.argv[2];
const graph = JSON.parse(fs.readFileSync(path.join(workspace, ".live-documentation", "index.json"), "utf8"));
const files = Object.keys(graph.files);
const docText = (codePath) => fs.readFileSync(path.join(workspace, ".live-documentation", "source", `${codePath}.md`), "utf8");
for (const codePath of files.sort()) {
  const text = docText(codePath);
  const deps = text.split("\n### Dependencies\n")[1]?.split("<!-- LIVE-DOC:END")[0].trim().split("\n").filter((line) => line.startsWith("- ")) ?? [];
  const symbols = (text.match(/^#### `[^`]+`/gmu) ?? []).length;
  const edges = (graph.edges ?? []).filter((edge) => edge.from === codePath).map((edge) => edge.to);
  console.log(`${codePath}  [${symbols} symbols]  edges -> ${edges.length ? edges.join(", ") : "none"}`);
  for (const dep of deps) console.log(`    ${dep}`);
}
