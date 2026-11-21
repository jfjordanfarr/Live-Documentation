#!/usr/bin/env node
// What of Node the scan's path needs, read from the scanning page's bundle as esbuild builds it: for each module of
// the engine and the generator in the bundle, tests aside, each of Node's modules (and `glob`) it imports and the
// members of each it names, and the globals of Node it names (`process`, `Buffer`, `__dirname`, `require`); then, for
// each of Node's modules, the members the stand-in must answer; the members of a package that exist only under Node
// (TypeScript's `ts.sys`), which no stand-in answers; and what each package from `node_modules` in the bundle imports
// of Node. Which modules are in the bundle, and what each imports, is esbuild's own account (its
// metafile); which members a module names is read from its syntax tree by TypeScript's parser.
//
//   node tests/page-scan/node-needs.mjs           prints the list
//   node tests/page-scan/node-needs.mjs --write   writes it to node-needs.json, for review
//
// `node-needs.test.ts` fails when the list differs from the committed node-needs.json, and when a stand-in answers for
// more or less than the list says.
import fs from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

import { bundleScanner, REPO, STAND_INS } from "./build-page.mjs";

export const NEEDS_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "node-needs.json");

/** The globals of Node a module may name without importing them, and how the page answers each. */
const GLOBALS = {
  process: "nothing: a page has no global process, and a call throws",
  Buffer: "nothing: a page has no Buffer, and a call throws",
  __dirname: "a constant the build defines for adapters/treeSitter.ts",
  __filename: "nothing",
  require: "require.resolve only, by the stand-in require-resolve.mjs",
  setImmediate: "nothing",
  global: "nothing"
};

/** Members that are namespaces of a module, read one level further: `fs.promises.readFile`, `path.posix.join`, `ts.sys.readFile`. */
const NAMESPACES = new Set(["promises", "posix", "win32", "sys"]);

/**
 * Members of a package from `node_modules` that exist only where it runs under Node: TypeScript builds `ts.sys`, its
 * host over Node's file system, only when it finds Node around it, and in a page it is undefined. A module's use of one
 * is a dependence on Node as much as an import of Node's own, though no stand-in can answer it.
 */
const NODE_HOSTED = { typescript: "sys" };

const sorted = (values) => [...new Set(values)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
const sortedObject = (entries) => Object.fromEntries([...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

/** Whether a node lies in a type, where a name of Node's is no call of it. */
function inType(node) {
  for (let at = node.parent; at; at = at.parent) if (ts.isTypeNode(at) || ts.isTypeAliasDeclaration(at) || ts.isInterfaceDeclaration(at)) return true;
  return false;
}

/** The member chain read off a name: `fs.promises.readFile` gives `promises.readFile`; a name not read as an object gives `(the module itself)`. */
function memberChain(identifier) {
  const members = [];
  let at = identifier;
  while (ts.isPropertyAccessExpression(at.parent) && at.parent.expression === at) {
    members.push(at.parent.name.text);
    if (!NAMESPACES.has(at.parent.name.text)) break;
    at = at.parent;
  }
  return members.length > 0 ? members.join(".") : "(the module itself)";
}

/**
 * Each of Node's modules (and `glob`) a module imports by name, with the members of each it names; and the globals
 * of Node it names. A name is the module's only where it is bound to the import, by the binder's own symbols, so that
 * a parameter called `path` is not read as the module; a global is a name bound to nothing in the module.
 */
export function namedMembers(source, checker) {
  const needs = new Map();
  const note = (specifier, member) => (needs.get(specifier) ?? needs.set(specifier, new Set()).get(specifier)).add(member);
  /** The symbols bound to a module (`fs`) or to a namespace of one (`promises as fs`), with the prefix of their members. */
  const bindings = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!(isBuiltin(specifier) || specifier === "glob" || Object.hasOwn(NODE_HOSTED, specifier)) || !clause || clause.isTypeOnly) continue;
    const only = NODE_HOSTED[specifier];
    const bind = (name, prefix) => bindings.set(checker.getSymbolAtLocation(name), { specifier, prefix, only });
    if (clause.name) bind(clause.name, "");
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) bind(clause.namedBindings.name, "");
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        if (element.isTypeOnly) continue;
        const imported = (element.propertyName ?? element.name).text;
        if (NAMESPACES.has(imported)) bind(element.name, `${imported}.`);
        else if (!only || imported === only) note(specifier, imported);
      }
    }
  }
  const read = (node) => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node) && !inType(node) && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) && !ts.isPropertyAssignment(node.parent)) {
      const symbol = checker.getSymbolAtLocation(node);
      const binding = symbol && bindings.get(symbol);
      const chain = binding && `${binding.prefix}${memberChain(node)}`;
      if (binding && (!binding.only || chain.split(".")[0] === binding.only)) note(binding.specifier, chain);
      else if (!symbol && Object.hasOwn(GLOBALS, node.text)) note("(global)", node.text === "__dirname" || node.text === "__filename" ? node.text : `${node.text}.${memberChain(node)}`);
    }
    ts.forEachChild(node, read);
  };
  read(source);
  return sortedObject([...needs].map(([specifier, members]) => [specifier, sorted(members)]));
}

const isEngineModule = (input) => /^packages\/(engine|generator)\/src\//u.test(input) && !/\.(test|spec)\.ts$/u.test(input);
const packageOf = (input) => {
  const rest = input.split("node_modules/").pop();
  return rest.startsWith("@") ? rest.split("/").slice(0, 2).join("/") : rest.split("/")[0];
};

/** The list, from a metafile of the scanning page's bundle. */
export function nodeNeedsOf(metafile) {
  const engine = [];
  const packages = new Map();
  const history = [];
  // One program of the engine's modules alone, unresolved and without a library, for the binder's symbols of each.
  const program = ts.createProgram(Object.keys(metafile.inputs).filter(isEngineModule).map((input) => path.join(REPO, input)), { noResolve: true, noLib: true, types: [], allowJs: false });
  const checker = program.getTypeChecker();
  for (const [input, info] of Object.entries(metafile.inputs)) {
    if (/\/history\//u.test(input) && input.startsWith("packages/")) history.push(input);
    const imported = info.imports.map((entry) => entry.original ?? entry.path).filter((specifier) => isBuiltin(specifier) || specifier === "glob");
    if (isEngineModule(input)) {
      const members = namedMembers(program.getSourceFile(path.join(REPO, input)), checker);
      // Esbuild's account and the syntax tree must agree on which modules are imported, or one of the two is misread.
      const fromTree = Object.keys(members).filter((specifier) => specifier !== "(global)" && !Object.hasOwn(NODE_HOSTED, specifier));
      if (sorted(imported).join() !== sorted(fromTree).join()) throw new Error(`${input}: esbuild says it imports ${sorted(imported).join(", ") || "nothing"} of Node, its syntax tree names ${sorted(fromTree).join(", ") || "nothing"}`);
      if (Object.keys(members).length > 0) engine.push([input, members]);
    } else if (input.includes("node_modules/") && imported.length > 0) {
      const name = packageOf(input);
      const found = packages.get(name) ?? packages.set(name, new Map()).get(name);
      for (const entry of info.imports.filter((each) => isBuiltin(each.original ?? each.path))) {
        const specifier = entry.original ?? entry.path;
        found.set(specifier, STAND_INS[specifier.replace(/^node:/u, "")] ? `the stand-in ${STAND_INS[specifier.replace(/^node:/u, "")]}` : "unresolved: a call throws in the page");
      }
    }
  }
  const standIns = new Map();
  const hosted = new Map();
  for (const [, members] of engine) {
    for (const [specifier, names] of Object.entries(members)) {
      const into = Object.hasOwn(NODE_HOSTED, specifier) ? hosted : standIns;
      for (const name of names) (into.get(specifier) ?? into.set(specifier, new Set()).get(specifier)).add(name);
    }
  }
  return {
    engine: sortedObject(engine),
    standIns: sortedObject([...standIns].map(([specifier, names]) => [specifier, sorted(names)])),
    hostedByNode: sortedObject([...hosted].map(([specifier, names]) => [specifier, sorted(names)])),
    globals: sortedObject(Object.entries(GLOBALS).filter(([name]) => [...(standIns.get("(global)") ?? [])].some((member) => member === name || member.startsWith(`${name}.`)))),
    packages: sortedObject([...packages].map(([name, found]) => [name, sortedObject(found)])),
    history: sorted(history)
  };
}

/** The list for the engine as it stands. */
export async function nodeNeeds() {
  const { metafile } = await bundleScanner({ minify: false });
  return nodeNeedsOf(metafile);
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const needs = await nodeNeeds();
  const text = `${JSON.stringify(needs, null, 2)}\n`;
  if (process.argv.includes("--write")) {
    fs.writeFileSync(NEEDS_FILE, text);
    console.log(`Wrote ${path.relative(REPO, NEEDS_FILE)}`);
  } else {
    process.stdout.write(text);
  }
}
