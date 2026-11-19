import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { HISTORY_FOLDERS, keysTheLens, SUMMARY_ENTRIES, SUMMARY_MODULES } from "./generatorIdentity";
import { summarizingEnvironment } from "./regenerate";

const repository = path.resolve(__dirname, "..", "..", "..", "..");

/** The repository-relative path of a file a source file imports, of any kind, when it is one of this repository's files. */
function resolveImport(from: string, specifier: string): string | undefined {
  let base: string;
  if (specifier.startsWith(".")) {
    base = path.posix.join(path.posix.dirname(from), specifier);
  } else {
    const aliased = /^@live-documentation\/(engine|generator|explorer)\/(.+)$/u.exec(specifier);
    if (!aliased) return undefined;
    base = `packages/${aliased[1]}/src/${aliased[2]}`;
  }
  for (const candidate of [`${base}.ts`, `${base}/index.ts`, base]) {
    try {
      readFileSync(path.join(repository, candidate));
      return candidate;
    } catch {
      // Not this one.
    }
  }
  throw new Error(`${from} imports ${specifier}, which resolves to no file`);
}

/** What a source file imports that leaves something at run time, and the imports it makes that cannot be followed. */
interface Imports {
  specifiers: string[];
  /** Each `import()` or `require()` whose argument is not a string literal, by the text of its call. */
  unfollowed: string[];
}

/**
 * The modules a source file imports that leave something at run time, read by the TypeScript parser: an `import type`,
 * an `export type` or an import whose every name is a type leaves nothing, and is elided. `import x = require()` is
 * read as the `require` it compiles to; a dynamic import or a `require` of a computed name cannot be followed and is
 * named.
 */
function runtimeImports(file: string, text = readFileSync(path.join(repository, file), "utf8")): Imports {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const imports: Imports = { specifiers: [], unfollowed: [] };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const elided =
        clause !== undefined &&
        (clause.isTypeOnly ||
          (clause.name === undefined && clause.namedBindings !== undefined && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every((element) => element.isTypeOnly)));
      if (!elided) imports.specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isImportEqualsDeclaration(node) && !node.isTypeOnly && ts.isExternalModuleReference(node.moduleReference)) {
      const expression = node.moduleReference.expression;
      if (ts.isStringLiteral(expression)) imports.specifiers.push(expression.text);
      else imports.unfollowed.push(node.getText(source));
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier) && !node.isTypeOnly) {
      imports.specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const [argument] = node.arguments;
      if (argument !== undefined && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))) imports.specifiers.push(argument.text);
      else imports.unfollowed.push(node.getText(source));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return imports;
}

/** Every file of this repository a source file reaches at run time, itself included, and the imports met that cannot be followed. */
function runtimeClosure(entries: readonly string[]): { reached: Set<string>; unfollowed: string[] } {
  const reached = new Set<string>();
  const unfollowed: string[] = [];
  const pending = [...entries];
  while (pending.length > 0) {
    const file = pending.pop()!;
    if (reached.has(file)) continue;
    reached.add(file);
    // A JSON file or any other that is not TypeScript is reached, keyed or not, and imports nothing of its own.
    if (!file.endsWith(".ts")) continue;
    const imports = runtimeImports(file);
    unfollowed.push(...imports.unfollowed.map((call) => `${file}: ${call}`));
    for (const specifier of imports.specifiers) {
      const resolved = resolveImport(file, specifier);
      if (resolved !== undefined) pending.push(resolved);
    }
  }
  return { reached, unfollowed };
}

/** The TypeScript modules of the history folders, tests aside. */
function historyModules(): string[] {
  return HISTORY_FOLDERS.flatMap((folder) =>
    readdirSync(path.join(repository, folder))
      .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
      .map((name) => `${folder}${name}`)
  );
}

/**
 * Whether a module does something on a summary's behalf that its imports into the summarizing process cannot show: it
 * starts a process, which is how the summarizing process is started and given its task and environment, or it
 * implements the version control, which writes the commit's tree the process reads.
 */
function actsForASummary(text: string): boolean {
  return (
    /["'](?:node:)?(?:child_process|worker_threads)["']/u.test(text) ||
    /(?<![.\w$])(?:execFileAsync|execFile|execFileSync|spawn|spawnSync|fork|exec|execSync)\s*\(/u.test(text) ||
    /\bimplements\s+VersionControl\b/u.test(text)
  );
}

/**
 * The modules of the history folders that start processes for another reason than a summary, each with why it is not
 * keyed: a module joins this list only by a reviewed reason.
 */
const ACTING_UNKEYED: Record<string, string> = {
  "packages/generator/src/history/generatorIdentity.ts": "computes the key itself; its git calls read this tool's checkout, never a commit's tree"
};

/** The names of an interface's members, read by the TypeScript parser. */
function membersOf(file: string, name: string): string[] {
  const source = ts.createSourceFile(file, readFileSync(path.join(repository, file), "utf8"), ts.ScriptTarget.Latest, true);
  const found = source.statements.find((statement): statement is ts.InterfaceDeclaration => ts.isInterfaceDeclaration(statement) && statement.name.text === name);
  if (found === undefined) throw new Error(`${file} declares no interface ${name}`);
  return found.members.map((member) => (member.name && ts.isIdentifier(member.name) ? member.name.text : member.getText(source)));
}

/**
 * What the command, which is not keyed, hands to the keyed code that makes a summary, each with why it cannot change
 * what a summary says unkeyed: a new member fails the guard until it is shown not to reach a summary, or joins the key.
 */
const HANDED_TO_REGENERATION: Record<string, string> = {
  versionControl: "an implementation of the version control, every one of which is keyed (the rule above)",
  configuration: "the lens's configuration, which is half of the key itself",
  lens: "the key itself, written into each summary",
  cacheFolder: "where summaries and texts are written, never what they say",
  keepIndex: "whether the full index is kept beside a summary, which the summary does not name",
  jobs: "how many commits are regenerated at once",
  deadline: "when to start no further commit",
  scratch: "where the trees are written and what a signal removes; summaries name workspace-relative paths only",
  progress: "where progress lines go"
};

/** What the keyed command side hands the summarizing process, each with what decides it. */
const HANDED_TO_SUMMARY: Record<string, string> = {
  tree: "the commit's tree, written by the keyed version control",
  configuration: "the lens's configuration, half of the key",
  lens: "the key",
  commit: "the commit summarized",
  summaryPath: "where the summary goes",
  textStore: "where the texts go",
  indexPath: "where the full index goes, when kept",
  // A limit, written down in the decision: what a disk cannot hold depends on the disk, which the key does not hold.
  unwritten: "the entries the keyed tree writer left out, as the disk it wrote to answered"
};

describe("the lens's key", () => {
  // Read once: parsing the closure's hundred-odd modules takes seconds on a loaded machine.
  let summaries: ReturnType<typeof runtimeClosure> | undefined;
  const summaryClosure = (): ReturnType<typeof runtimeClosure> => (summaries ??= runtimeClosure(SUMMARY_ENTRIES));

  it("is made of every file the summarizing process runs, and every file the command runs on its behalf", () => {
    const { reached } = summaryClosure();
    expect(reached.size).toBeGreaterThan(20);
    const unkeyed = [...reached].filter((file) => !keysTheLens(file));
    // A file the summaries depend on and the key leaves out would let the cache serve a summary another generator made.
    expect(unkeyed).toEqual([]);
    const reachedHistory = [...reached].filter((file) => HISTORY_FOLDERS.some((folder) => file.startsWith(folder)));
    expect(reachedHistory.filter((file) => !SUMMARY_MODULES.includes(file))).toEqual([]);
  });

  it("keys every module of the history folders that starts a process or writes a commit's tree, which no import shows", () => {
    const acting = historyModules().filter((file) => actsForASummary(readFileSync(path.join(repository, file), "utf8")));
    expect(acting.sort()).toEqual(["packages/engine/src/live-docs/history/git.ts", "packages/generator/src/history/generatorIdentity.ts", "packages/generator/src/history/regenerate.ts"]);
    expect(acting.filter((file) => !keysTheLens(file) && ACTING_UNKEYED[file] === undefined)).toEqual([]);
    // Every summary module is reached by import from the summarizing process or the command's side of it, or acts so.
    expect(SUMMARY_MODULES.filter((file) => !summaryClosure().reached.has(file) && !acting.includes(file))).toEqual([]);
  });

  it("would have found the command's tree and environment outside the key, as they stood before this rule", () => {
    // As `computeHistory.ts` read until 2026-11-19: it started the summarizing process with the tree's environment.
    expect(actsForASummary(`import { fork, type ChildProcess } from "node:child_process";\nconst child = fork(worker, [task], { env });`)).toBe(true);
    expect(actsForASummary(`class GitRepository implements VersionControl {}`)).toBe(true);
    expect(actsForASummary(`import type { VersionControl } from "./versionControl";`)).toBe(false);
    expect(keysTheLens("packages/generator/src/history/computeHistory.ts")).toBe(false);
    // A process started without importing `child_process` by name, through a dynamic import, a require or a helper.
    expect(actsForASummary(`const { fork } = await import("node:child_process");`)).toBe(true);
    expect(actsForASummary(`const cp = require("child_process");`)).toBe(true);
    expect(actsForASummary(`await execFileAsync("git", ["ls-tree", change], options);`)).toBe(true);
  });

  it("gives the summarizing process a named environment, and nothing else of the person's", () => {
    const given = summarizingEnvironment({ PATH: "/usr/bin", TMPDIR: "/tmp", TSX_TSCONFIG_PATH: "./tsconfig.base.json", NODE_OPTIONS: "--require evil.js", GIT_DIR: "/elsewhere", LANG: "tr_TR.UTF-8", HOME: "/home/ada" });
    expect(given).toEqual({ PATH: "/usr/bin", TMPDIR: "/tmp", TSX_TSCONFIG_PATH: "./tsconfig.base.json" });
    // The process is started with that environment and the tree's own, never the command's whole one.
    const regenerate = readFileSync(path.join(repository, "packages/generator/src/history/regenerate.ts"), "utf8");
    expect(regenerate).toContain("{ ...summarizingEnvironment(process.env), ...tree.environment }");
    expect(regenerate).not.toMatch(/env:\s*(?:\{\s*\.\.\.process\.env|process\.env)/u);
  });

  it("holds what the command hands to the code that makes a summary to members each shown not to change it unkeyed", () => {
    // A member added to either, an environment say, fails here until it is shown not to reach a summary or joins the key.
    expect(membersOf("packages/generator/src/history/regenerate.ts", "RegenerationContext").sort()).toEqual(Object.keys(HANDED_TO_REGENERATION).sort());
    expect(membersOf("packages/generator/src/history/summarizeChange.ts", "SummaryTask").sort()).toEqual(Object.keys(HANDED_TO_SUMMARY).sort());
    // The command calls the keyed side by that context alone.
    const command = readFileSync(path.join(repository, "packages/generator/src/history/computeHistory.ts"), "utf8");
    expect(command).not.toMatch(/\bfork\s*\(|\bspawn\s*\(|summarizeChange/u);
  });

  it("meets no import it cannot follow on the way", () => {
    // A computed `import()` or `require()` could load a file no rule names; none may stand where the summaries are decided.
    expect(summaryClosure().unfollowed).toEqual([]);
  });

  it("follows every way a module is loaded, and names what it cannot follow", () => {
    const imports = runtimeImports(
      "packages/engine/src/live-docs/history/probe.ts",
      [
        `import data from "./data.json";`,
        `import legacy = require("./legacy");`,
        `import type { T } from "./types";`,
        `const later = import("./later");`,
        `const name = "./computed";`,
        `const computed = require(name);`
      ].join("\n")
    );
    expect(imports.specifiers).toEqual(["./data.json", "./legacy", "./later"]);
    expect(imports.unfollowed).toEqual(["require(name)"]);
  });

  it("finds an import the summarizing process would make of a module the key leaves out", () => {
    // The check above must be able to fail: the sequence's codec, reached from the sequence, is a module the key leaves out.
    expect(keysTheLens("packages/engine/src/live-docs/history/codec.ts")).toBe(false);
    expect(runtimeClosure(["packages/engine/src/live-docs/history/sequence.ts"]).reached).toContain("packages/engine/src/live-docs/history/codec.ts");
  });

  it("leaves out the tests and the history modules that decide nothing of a summary, and keeps every other file of the two packages", () => {
    expect(keysTheLens("packages/engine/src/live-docs/graph.ts")).toBe(true);
    expect(keysTheLens("packages/engine/package.json")).toBe(true);
    expect(keysTheLens("packages/generator/src/generator.ts")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/history/summary.ts")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/history/git.ts")).toBe(true);
    expect(keysTheLens("packages/generator/src/history/summarizeChange.ts")).toBe(true);
    expect(keysTheLens("packages/generator/src/history/regenerate.ts")).toBe(true);
    // Data in a history folder, which a module may import or read at run time, is keyed whoever reads it.
    expect(keysTheLens("packages/engine/src/live-docs/history/table.json")).toBe(true);
    expect(keysTheLens("packages/engine/src/live-docs/graph.test.ts")).toBe(false);
    expect(keysTheLens("packages/engine/src/live-docs/history/queries.ts")).toBe(false);
    expect(keysTheLens("packages/generator/src/history/computeHistory.ts")).toBe(false);
    expect(keysTheLens("packages/generator/src/history/headCheck.ts")).toBe(false);
    expect(keysTheLens("packages/explorer/src/client/index.ts")).toBe(false);
  });
});
