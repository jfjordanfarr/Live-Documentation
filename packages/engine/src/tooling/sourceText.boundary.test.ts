/**
 * A failure of the machine's (a failed system call: too many open files, a full disk, a permission refused) is never
 * read as a property of a file: every catch round a read or a probe of a file or a folder hands what it caught to
 * `throwIfMachineFailure` (`sourceText.ts`) or throws it again, so that it reaches the generator's per-file catch,
 * which names the file, and a history worker publishes nothing made with it. Twenty-two catches were mended so on
 * 2026-11-20, after an independent review found files silently missing from published summaries; four were named by a
 * test, and a catch written later would have been named by none. This test reads the product's sources with
 * TypeScript's own parser and holds every such catch, the next one written among them.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
/** The engine (its adapters, readers and tooling) and the generator, whose run reads every file through them. */
const ROOTS = [path.join(repoRoot, "packages", "engine", "src"), path.join(repoRoot, "packages", "generator", "src")];
const SOURCE = /\.(?:[cm]?ts|tsx)$/u;

/**
 * The calls that read or probe a file or a folder, in their callback, sync and promise forms alike; and the run's reads
 * of its files through the host (`readingOf`, `headOf`: `workspaceFiles.ts`, since 2026-11-22), which a reader may ask
 * of the file index it is handed.
 */
const READS = new Set([
  "readSourceText",
  "readingOf",
  "headOf",
  "readFile",
  "readFileSync",
  "stat",
  "statSync",
  "lstat",
  "lstatSync",
  "readdir",
  "readdirSync",
  "access",
  "accessSync",
  "opendir",
  "opendirSync",
  "open",
  "openSync",
  "realpath",
  "realpathSync",
  "readlink",
  "readlinkSync"
]);

/**
 * Catches that read or probe a file and keep a failure of the machine's from the run, each with its reason. A catch
 * named here that no longer swallows such a failure, or is no longer found, turns the test red too, so that the list
 * says what is true.
 */
const ALLOWED: Record<string, string> = {
  "packages/generator/src/generatorCore.ts › runLiveDocs":
    "The per-file catch every other hands to: it names the file in `failed`, with the error, by which a person's run says why and a history worker publishes nothing.",
  "packages/generator/src/generatorCore.ts › cleanupEmptyParents":
    "Tidying after a pruned doc: no doc and no fact is read from an empty folder, a run stopped here would pass on a second try with nothing mended (the doc is gone, the folder never visited again), and on Windows a folder another program holds is ordinary. Any failure leaves the folder.",
  "packages/engine/src/live-docs/discoveryCore.ts › buildWorkspaceIndexes":
    "The index pass keeps the failure for the file (`unmapped`), and the per-file pass throws it again into the per-file catch (`unindexed` in `generatorCore.ts`).",
  "packages/engine/src/live-docs/history/textStore.ts › putTexts":
    "A text the probe cannot see is written, and the store is addressed by content: writing it again is harmless, and a write that fails throws its own failure.",
  "packages/generator/src/history/computeHistory.ts › holdLock": "The time a lock was taken, for the message naming its holder; nothing of a file is read.",
  "packages/generator/src/history/computeHistory.ts › absentFromCache": "A summary the probe cannot see is made again: work, never a wrong summary.",
  "packages/generator/src/history/computeHistory.ts › recordedPool": "A record of the pool's memory that does not read sizes the pool by default.",
  "packages/generator/src/history/computeHistory.ts › read": "A summary that does not read is damaged, and the change is summarized again.",
  "packages/generator/src/history/computeHistory.ts › deriveSequence": "A text of the store that does not read is damaged, and the change that named it is summarized again.",
  "packages/generator/src/history/computeHistory.ts › writtenSequence": "A sequence that does not read is derived again from the summaries.",
  "packages/generator/src/history/computeHistory.ts › writtenSequence (2)": "A sequence whose record does not read is derived again from the summaries.",
  "packages/generator/src/history/computeHistory.ts › exists": "Whether the words' folder, named by its content's hash, stands: one the probe cannot see is written again, and a write that fails throws its own failure.",
  "packages/generator/src/history/regenerate.ts › lane": "The failure is kept (`failure`) and thrown once every lane has stopped."
};

interface Source {
  file: string;
  tree: ts.SourceFile;
}

/** Every source file of the engine and the generator, without tests. */
async function productSources(): Promise<Source[]> {
  const sources: Source[] = [];
  for (const root of ROOTS) {
    for (const entry of await fs.readdir(root, { recursive: true, withFileTypes: true })) {
      const file = path.join(entry.parentPath, entry.name);
      if (!entry.isFile() || !SOURCE.test(entry.name) || /\.test\.[^.]+$/u.test(entry.name) || entry.name.endsWith(".d.ts")) continue;
      if (path.relative(root, file).split(path.sep).some((part) => part === "node_modules" || part === "dist" || part === "__fixtures__")) continue;
      sources.push({ file: path.relative(repoRoot, file).split(path.sep).join("/"), tree: parse(await fs.readFile(file, "utf8")) });
    }
  }
  return sources.sort((left, right) => (left.file < right.file ? -1 : left.file > right.file ? 1 : 0));
}

function parse(text: string): ts.SourceFile {
  return ts.createSourceFile("file.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/** Every node below `root`, `root` among them, by an explicit stack. */
function nodesOf(root: ts.Node): ts.Node[] {
  const found: ts.Node[] = [];
  const stack: ts.Node[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    found.push(node);
    ts.forEachChild(node, (child) => {
      stack.push(child);
    });
  }
  return found;
}

/** The name a call is made by: `f(…)`, `a.f(…)`, `a["f"](…)`. */
function calledName(call: ts.CallExpression): string | undefined {
  const callee = call.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  if (ts.isElementAccessExpression(callee) && ts.isStringLiteralLike(callee.argumentExpression)) return callee.argumentExpression.text;
  return undefined;
}

/** The name a function-like node is known by: its own, or the variable, property or method it is assigned to. */
function functionName(node: ts.Node): string | undefined {
  if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isFunctionExpression(node)) && node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) return node.name.text;
  if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.parent) {
    const parent = node.parent;
    if ((ts.isVariableDeclaration(parent) || ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent)) && ts.isIdentifier(parent.name)) return parent.name.text;
  }
  return undefined;
}

/** A source's functions by name, with the calls each makes, and the names it imports from the other sources, each resolved to its module. */
interface Module {
  source: Source;
  functions: Map<string, ts.CallExpression[]>;
  imports: Map<string, { from: string; name: string }>;
  namespaces: Map<string, string>;
}

/** The source an import names, among those read: a relative path, or the engine's or the generator's package path. */
function resolvedImport(fromFile: string, specifier: string, known: ReadonlySet<string>): string | undefined {
  const aliased = /^@live-documentation\/(engine|generator)\/(.+)$/u.exec(specifier);
  const base = specifier.startsWith(".") ? path.posix.join(path.posix.dirname(fromFile), specifier) : aliased ? `packages/${aliased[1]}/src/${aliased[2]}` : undefined;
  if (base === undefined) return undefined;
  const stem = base.replace(/\.[cm]?js$/u, "");
  return [stem, `${stem}.ts`, `${stem}/index.ts`].find((candidate) => known.has(candidate));
}

function moduleOf(source: Source, known: ReadonlySet<string>): Module {
  const functions = new Map<string, ts.CallExpression[]>();
  const imports = new Map<string, { from: string; name: string }>();
  const namespaces = new Map<string, string>();
  for (const node of nodesOf(source.tree)) {
    const name = ts.isFunctionLike(node) ? functionName(node) : undefined;
    if (name !== undefined) functions.set(name, [...(functions.get(name) ?? []), ...nodesOf(node).filter(ts.isCallExpression)]);
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.importClause?.namedBindings) {
      const from = resolvedImport(source.file, node.moduleSpecifier.text, known);
      const bindings = node.importClause.namedBindings;
      if (from === undefined) continue;
      if (ts.isNamespaceImport(bindings)) namespaces.set(bindings.name.text, from);
      else for (const element of bindings.elements) imports.set(element.name.text, { from, name: (element.propertyName ?? element.name).text });
    }
  }
  return { source, functions, imports, namespaces };
}

/** Whether a call reads or probes a file: a read by its name (`fs.readFile`, `statSync`), or a function that does, of this module or imported. */
function callReads(module: Module, call: ts.CallExpression, reading: ReadonlySet<string>): boolean {
  const name = calledName(call);
  if (name === undefined) return false;
  if (READS.has(name)) return true;
  const callee = call.expression;
  if (ts.isIdentifier(callee)) {
    const imported = module.imports.get(name);
    return reading.has(`${module.source.file}#${name}`) || (imported !== undefined && reading.has(`${imported.from}#${imported.name}`));
  }
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
    const from = module.namespaces.get(callee.expression.text);
    return from !== undefined && reading.has(`${from}#${name}`);
  }
  return false;
}

/**
 * The modules' own wrappers of a read, as `<file>#<function>`: a function whose body calls a read or another wrapper,
 * of its own module or imported from another source read here, until no more are found.
 */
function readingFunctions(modules: readonly Module[]): Set<string> {
  const reading = new Set<string>();
  for (let grew = true; grew; ) {
    grew = false;
    for (const module of modules) {
      for (const [name, calls] of module.functions) {
        const key = `${module.source.file}#${name}`;
        if (reading.has(key) || !calls.some((call) => callReads(module, call, reading))) continue;
        reading.add(key);
        grew = true;
      }
    }
  }
  return reading;
}

/** The modules of the sources, and the functions among them that read. */
function readingOf(sources: readonly Source[]): { modules: Module[]; reading: Set<string> } {
  const known = new Set(sources.map(({ file }) => file));
  const modules = sources.map((source) => moduleOf(source, known));
  return { modules, reading: readingFunctions(modules) };
}

/** Whether a catch's body hands what it caught on: to `throwIfMachineFailure`, or by a `throw` of an expression that names it. */
function handsOn(caught: string | undefined, body: ts.Node): boolean {
  if (caught === undefined) return false;
  const names = (node: ts.Node): boolean => nodesOf(node).some((inner) => ts.isIdentifier(inner) && inner.text === caught);
  return nodesOf(body).some((node) =>
    (ts.isCallExpression(node) && calledName(node) === "throwIfMachineFailure" && node.arguments.length > 0 && names(node.arguments[0])) ||
    (ts.isThrowStatement(node) && names(node.expression))
  );
}

/** The name of the function a node lies in, for a place that survives an edit elsewhere in the file. */
function enclosingName(node: ts.Node): string {
  for (let at: ts.Node | undefined = node.parent; at; at = at.parent) {
    const name = ts.isFunctionLike(at) ? functionName(at) : undefined;
    if (name !== undefined) return name;
  }
  return "(module)";
}

/**
 * Every catch in a source whose guarded code reads or probes a file and that does not hand what it caught on, by its
 * place, `<file> › <function>`, a second in the same function `… (2)`: `try { … } catch (e) { … }`, and the promise
 * form, `read(…).catch((e) => …)`, the read in the expression the catch is chained to. And every probe that answers
 * "no" for every failure by itself, with no catch to find: `existsSync`, and `fs.exists` (a function of the module's
 * own named `exists` is its own, and read as any other), by `<file> › <function>: existsSync`.
 */
function swallowingCatches(module: Module, reading: ReadonlySet<string>): string[] {
  const { file, tree } = module.source;
  const reads = (node: ts.Node): boolean => nodesOf(node).some((inner) => ts.isCallExpression(inner) && callReads(module, inner, reading));
  const places: string[] = [];
  const counted = new Map<string, number>();
  const name = (node: ts.Node): void => {
    const base = `${file} › ${enclosingName(node)}`;
    const count = (counted.get(base) ?? 0) + 1;
    counted.set(base, count);
    places.push(count === 1 ? base : `${base} (${count})`);
  };
  for (const node of nodesOf(tree).sort((left, right) => left.getStart(tree) - right.getStart(tree))) {
    if (ts.isTryStatement(node) && node.catchClause && reads(node.tryBlock)) {
      const binding = node.catchClause.variableDeclaration?.name;
      if (!handsOn(binding && ts.isIdentifier(binding) ? binding.text : undefined, node.catchClause.block)) name(node);
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "catch" && reads(node.expression.expression)) {
      const handler = node.arguments[0];
      const parameter = handler && (ts.isArrowFunction(handler) || ts.isFunctionExpression(handler)) ? handler.parameters[0]?.name : undefined;
      if (!handler || !(ts.isArrowFunction(handler) || ts.isFunctionExpression(handler)) || !handsOn(parameter && ts.isIdentifier(parameter) ? parameter.text : undefined, handler.body)) name(node);
    }
    if (ts.isCallExpression(node)) {
      const called = calledName(node);
      if (called === "existsSync" || (called === "exists" && !module.functions.has("exists"))) places.push(`${file} › ${enclosingName(node)}: ${called}`);
    }
  }
  return places;
}

describe("a failure of the machine's, met by a catch round a read", () => {
  it("is handed on by every catch round a read or a probe of a file in the engine and the generator, but those named with a reason", async () => {
    const sources = await productSources();
    expect(sources.map(({ file }) => file)).toContain("packages/engine/src/tooling/sourceText.ts");
    const { modules, reading } = readingOf(sources);
    const found = modules.flatMap((module) => swallowingCatches(module, reading));
    expect(found.filter((place) => !(place in ALLOWED))).toEqual([]);
    expect(Object.keys(ALLOWED).filter((place) => !found.includes(place))).toEqual([]);
    // Parsing every source of two packages takes about two seconds alone and more than five beside the whole unit
    // suite, where the first gate on the joined code cut it at the default limit (2026-11-20).
  }, 60_000);

  it("sees a catch that swallows a read, by each form, and passes one that hands it on", () => {
    // `wrapped` reads a file in this module, `load` in another, imported by name or as a namespace.
    const swallowed = (text: string): string[] => {
      const sources = [
        { file: "src/b.ts", tree: parse(`export async function load(file) { return (await fs.readFile(file)).toString(); }\nexport function quiet() { return 1; }`) },
        { file: "src/a.ts", tree: parse(`import { load, quiet } from "./b";\nimport * as b from "./b";\nfunction wrapped(file) { return load(file); }\n${text}`) }
      ];
      const { modules, reading } = readingOf(sources);
      return swallowingCatches(modules[1], reading).map((place) => place.replace("src/a.ts › ", ""));
    };
    for (const text of [
      `async function f() { try { await fs.readFile("x"); } catch { return undefined; } }`,
      `async function f() { try { await readSourceText("x"); } catch (error) { return undefined; } }`,
      `function f() { try { statSync("x"); } catch (error) { log(error); } }`,
      `async function f() { try { await wrapped("x"); } catch (error) { return []; } }`,
      `async function f() { try { await load("x"); } catch (error) { return []; } }`,
      `async function f() { try { await b.load("x"); } catch (error) { return []; } }`,
      `async function f() { try { await Promise.all(files.map((file) => fs.stat(file))); } catch (error) { return []; } }`,
      `async function f() { return fs.lstat("x").catch(() => undefined); }`,
      `async function f() { return fs.readdir("x").catch((error) => { console.warn(error); return []; }); }`
    ]) {
      expect(swallowed(text), text).toEqual(["f"]);
    }
    for (const [text, called] of [
      [`function f() { return existsSync("x"); }`, "existsSync"],
      [`function f() { return fs.existsSync("x") ? 1 : 2; }`, "existsSync"],
      [`function f(done) { fs.exists("x", done); }`, "exists"]
    ]) {
      expect(swallowed(text), text).toEqual([`f: ${called}`]);
    }
    for (const text of [
      `async function exists(file) { try { await fs.access(file); return true; } catch (error) { throwIfMachineFailure(error); return false; } }\nasync function f() { return exists("x"); }`,
      `function f() { return fs.statSync("x", { throwIfNoEntry: false }) !== undefined; }`,
      `async function f() { try { await fs.readFile("x"); } catch (error) { throwIfMachineFailure(error); return undefined; } }`,
      `async function f() { try { await fs.readFile("x"); } catch (error) { if (error.code === "ENOENT") return undefined; throw error; } }`,
      `async function f() { try { await fs.readFile("x"); } catch (error) { throw new Error("could not read x", { cause: error }); } }`,
      `async function f() { return fs.stat("x").catch((error) => { throwIfMachineFailure(error); return undefined; }); }`,
      `function f() { try { JSON.parse(text); } catch { return undefined; } }`,
      `function f() { try { quiet(); } catch { return undefined; } }`
    ]) {
      expect(swallowed(text), text).toEqual([]);
    }
    expect(swallowed(`function g() { try { fs.statSync("x"); } catch {} try { fs.statSync("y"); } catch {} }`)).toEqual(["g", "g (2)"]);
  });
});
