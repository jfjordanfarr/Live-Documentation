// Probe of 2026-11-22 (not product code): each check the blind readers' cases rest on, taken out of the module once,
// to see which cases then fail. A case that still passes with its check out proves nothing by that check: it is
// guarded by another, or by nothing. The module is restored after every run, and at the end.
//
//   node <this folder>/check-removal.mjs <repository root> <out.json>
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const [root, out] = process.argv.slice(2);
const modulePath = path.join(root, "packages/stored-form/src/storedForm.ts");
const original = readFileSync(modulePath, "utf8");

/** Each check: a name, and the text to take out with what stands in its place. */
const removals = [
  ["no byte after a section's last item", [["    if (this.left !== 0) refuse(`${this.what} has ${this.left} bytes after its last fact`);", ""]]],
  ["the end counts the frames before it", [["frames[i + 2].count !== frames.length - 1 || ", ""]]],
  ["a section inflates to exactly its raw length", [["  if (out.length !== rawLength) refuse(`${what} inflates to ${out.length} bytes, not the ${rawLength} it declares`);", ""]]],
  ["a text's file lines are written again and compared", [['    expectSame(lines.slice(start, n - 1).join("\\n"), fileLines(held).join("\\n"));', ""]]],
  ["a file's authored line is required next", [['    if (row[0] !== path || row[1] !== "authored" || row.length !== 3) refuse(`line ${n} is not ${JSON.stringify(path)}\'s authored words`);', ""]]],
  ["a file's lines begin with its file line", [['    if (typeof path !== "string" || row[1] !== "file" || row.length !== 5) refuse(`line ${n} is not a file\'s first line`);', '    if (typeof path !== "string") refuse(`line ${n} is not a file\'s first line`);']]],
  ["at most one cited-by line", [["    if (cited.length > 1) refuse(`${JSON.stringify(path)} has two cited-by lines`);", ""]]],
  ["a wire is never the file's own", [["if (j >= count || j === i) refuse", "if (j >= count) refuse"]]],
  ["the head's version", [["  if (version !== LAYOUT_VERSION) refuse(`the layout's version is ${version}; this reader reads ${LAYOUT_VERSION}`);", ""]]],
  ["the head's count is 0", [["frames[0].kind !== HEAD || frames[0].count !== 0", "frames[0].kind !== HEAD"]]],
  ["a frame's kind is one the layout defines", [["    if (kind < HEAD || kind > END) refuse(`a section of kind ${kind} at byte ${at}, which the layout does not define`);", ""]]],
  ["a strings frame holds at least one string", [['      if (f.count === 0) refuse("a section of no strings");', ""]]],
  ["a mark's undefined bits are zero", [["    if ((n & ~defined) !== 0) refuse(`${what} sets a mark the layout does not define`);", ""]]],
  ["a path's shared beginning is the longest", [['    if (shared < previous && rest.length > 0 && buffer[shared] === rest[0]) refuse("a path\'s shared beginning is written shorter than it is");', ""]]],
  ["the paths are in strict order", [["    if (paths.length > 0 && comparePaths(paths[paths.length - 1], p) >= 0) refuse(`the paths are not in order at ${JSON.stringify(p)}`);", ""]]],
  ["the records' paths are the paths section's", [["          if (file.codePath !== paths[first + i]) refuse(`the paths name ${JSON.stringify(paths[first + i])} where the records hold ${JSON.stringify(file.codePath)}`);", ""]]],
  ["a folder is empty or a path", [['  return folder === "" ? folder : checkPath(folder, what);', "  return folder;"]]],
  ["the extension holds no slash, backslash or NUL", [['    if (c === 0x2f || c === 0x5c || c === 0) refuse("the location\'s extension holds a slash, a backslash or a NUL");', ""]]],
  ["the deflate stream ends where the stored bytes end, on the writing side", [["  try {\n    await written;\n  } catch {\n    return refuse(`${what} is not a whole raw deflate stream`);\n  }", "  await written.catch(() => undefined);"]]],
  [
    "an inflater's error is a refusal, on both sides",
    [
      ["    if (error instanceof Refusal) throw error;\n    return refuse(`${what} is not a whole raw deflate stream`);", "    throw error;"],
      ["  try {\n    await written;\n  } catch {\n    return refuse(`${what} is not a whole raw deflate stream`);\n  }", "  await written;"]
    ]
  ],
  ["a text's file lines are written again and compared, and the authored line is required next", [['    expectSame(lines.slice(start, n - 1).join("\\n"), fileLines(held).join("\\n"));', ""], ['    if (row[0] !== path || row[1] !== "authored" || row.length !== 3) refuse(`line ${n} is not ${JSON.stringify(path)}\'s authored words`);', ""]]]
];

const results = [];
try {
  for (const [name, edits] of removals) {
    let text = original;
    for (const [from, to] of edits) {
      if (!text.includes(from)) throw new Error(`the check "${name}" is not where it was: ${from.slice(0, 80)}`);
      text = text.replace(from, to);
    }
    writeFileSync(modulePath, text);
    const report = path.join(path.dirname(out), "removal-report.json");
    try {
      execFileSync("npx", ["vitest", "run", "--project", "unit", "packages/stored-form/test/storedForm.blind.test.ts", "--reporter=json", `--outputFile=${report}`], { cwd: root, stdio: "ignore" });
    } catch {
      // A run with failures exits non-zero; the report says which.
    }
    const tests = JSON.parse(readFileSync(report, "utf8")).testResults.flatMap((r) => r.assertionResults);
    rmSync(report);
    results.push({ check: name, failed: tests.filter((t) => t.status === "failed").map((t) => t.title), passed: tests.filter((t) => t.status === "passed").length });
    console.log(name, "->", results[results.length - 1].failed.join("; ") || "(none failed)");
  }
} finally {
  writeFileSync(modulePath, original);
}
writeFileSync(out, `${JSON.stringify(results, null, 1)}\n`);
