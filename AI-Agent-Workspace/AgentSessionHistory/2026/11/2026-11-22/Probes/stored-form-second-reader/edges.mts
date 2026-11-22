// Second reading of 2026-11-22 (README.md beside this file), not product code: files at the edges the Go reader's questions name (8, 9, 10), each as text and, when the module writes it, binary.
import { writeFileSync, mkdirSync } from "node:fs";
import { textOfScan, writeScan, type Scan, type StoredFile } from "../../../../../../../packages/stored-form/src/storedForm";
// Run as npx tsx --tsconfig ./tsconfig.base.json edges.mts <dir>, then samples.ts answers <dir>.
const dir = process.argv[2]; mkdirSync(dir, { recursive: true });
const plain = (codePath: string, more: Partial<StoredFile> = {}): StoredFile => ({ codePath, layer: 4, entries: [], authored: "", symbols: [], dependencies: [], ...more });
const head = { location: { root: "", baseLayer: "", extension: ".md" }, scanner: "s", leftOut: [] };
const cases: [string, Scan][] = [
  ["edge-path-backslash-inside", { head, files: [plain("a\\b.ts")] }],
  ["edge-link-empty", { head, files: [plain("a", { dependencies: [{ label: "x", link: "", qualifiers: [] }] })] }],
  ["edge-link-nul", { head, files: [plain("a", { dependencies: [{ label: "x", link: "x\u0000y", qualifiers: [] }] })] }],
  ["edge-target-outside-not-a-path", { head, files: [plain("a", { dependencies: [{ label: "x", link: "x.md", target: "../x", qualifiers: [] }] })] }],
  ["edge-anchor-outside-scan", { head, files: [plain("a", { dependencies: [{ label: "x", link: "x.md#y", target: "x", anchor: "y", qualifiers: [] }] })] }],
  ["edge-self-edge-anchor", { head, files: [plain("a", { dependencies: [{ label: "a", link: "a.md#y", target: "a", anchor: "y", qualifiers: ["re-export", "type-only", "configuration", "contract"] }] })] }]
];
for (const [name, scan] of cases) {
  writeFileSync(`${dir}/${name}.txt`, textOfScan(scan));
  const w = await writeScan(scan);
  if (w.ok) writeFileSync(`${dir}/${name}.fpk`, w.value);
  console.log(name, w.ok ? "written" : `writer refuses: ${w.reason}`);
}
