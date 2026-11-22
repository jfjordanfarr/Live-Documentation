// For every dependency line a scan writes of a script file it keeps, whether the line is marked "type-only" three ways:
// as the tip marks it (the statement's modifier, taken from the first statement of the lines' group), by the written
// modifiers (a name's own `type` or its statement's, every name and statement of the line agreeing), and by what the
// compiler elides as well (a name that, by TypeScript's own checker, names only a type). Reads only: nothing is
// generated, so it runs over read-only corpora in place. Written 2026-11-22, the eighth milestone.
//   tsx --tsconfig tsconfig.base.json type-only-names.mts <folder> <label>
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "@live-documentation/engine/live-docs/coreConstants";
import { resolveDependency } from "@live-documentation/engine/live-docs/dependencies";
import { discoverTargetFiles } from "@live-documentation/engine/live-docs/discovery";
import { workspaceListing } from "@live-documentation/engine/tooling/workspaceListing";

const [folder, label] = process.argv.slice(2);
const root = path.resolve(folder);
const configFile = path.join(root, ".live-docs.config.json");
const config = normalizeLiveDocumentationConfig(fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, "utf8")) : undefined);
const kept = await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false });
const listing = workspaceListing(root, kept.map((file) => path.relative(root, file).split(path.sep).join("/")));
const scripts = kept.filter((file) => SUPPORTED_SCRIPT_EXTENSIONS.has(path.extname(file).toLowerCase()));

const program = ts.createProgram(scripts, {
  allowJs: true,
  checkJs: false,
  noEmit: true,
  skipLibCheck: true,
  jsx: ts.JsxEmit.Preserve,
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowImportingTsExtensions: true,
  types: []
});
const checker = program.getTypeChecker();

/** A statement's share of a line: its names, the names its own or its statement's modifier types, and those the checker finds name only a type. */
interface Part {
  statementTyped: boolean;
  tipTyped: boolean;
  names: string[];
  written: Set<string>;
  elided: Set<string>;
}

function namesOnlyAType(name: ts.Identifier): boolean {
  const alias = checker.getSymbolAtLocation(name);
  if (!alias || !(alias.flags & ts.SymbolFlags.Alias)) return false;
  const target = checker.getAliasedSymbol(alias);
  if (!target || target.escapedName === "unknown" || target.flags & ts.SymbolFlags.Value) return false;
  return (target.flags & ts.SymbolFlags.Type) !== 0 || (target.flags & ts.SymbolFlags.Namespace) !== 0;
}

const totals = { scripts: scripts.length, lines: 0, tip: 0, written: 0, elided: 0, gained: 0, lost: 0, elidedBeyondWritten: 0, symbolsGained: 0 };
const examples: Record<string, string[]> = { gained: [], lost: [], elidedBeyondWritten: [], symbolsGained: [] };
const example = (kind: string, text: string): void => {
  if (examples[kind].length < 6) examples[kind].push(text);
};

for (const absolutePath of scripts) {
  const sourceFile = program.getSourceFile(absolutePath);
  if (!sourceFile) continue;
  const file = path.relative(root, absolutePath).split(path.sep).join("/");
  const groups = new Map<string, { resolved: boolean; parts: Part[] }>();
  for (const statement of sourceFile.statements) {
    const isImport = ts.isImportDeclaration(statement);
    const isExport = ts.isExportDeclaration(statement);
    if (isExport && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause) && statement.isTypeOnly) {
      // A local `export type { … }`: each name's own symbol flag, which reads only the name's own modifier at the tip.
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) {
          totals.symbolsGained += 1;
          example("symbolsGained", `${file}: ${element.name.text}`);
        }
      }
      continue;
    }
    if (!(isImport || isExport) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const resolved = await resolveDependency(specifier, absolutePath, root, listing);
    const key = resolved ?? specifier;
    const part: Part = { statementTyped: false, tipTyped: false, names: [], written: new Set(), elided: new Set() };
    const add = (name: string, own: boolean, identifier: ts.Identifier): void => {
      part.names.push(name);
      if (own || part.statementTyped) part.written.add(name);
      if (own || part.statementTyped || namesOnlyAType(identifier)) part.elided.add(name);
    };
    if (isImport) {
      const clause = statement.importClause;
      part.statementTyped = Boolean(clause?.isTypeOnly);
      part.tipTyped = part.statementTyped;
      if (clause?.name) add(clause.name.text, false, clause.name);
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) add((element.propertyName ?? element.name).text, element.isTypeOnly, element.name);
      }
    } else {
      part.statementTyped = statement.isTypeOnly;
      const elements = statement.exportClause && ts.isNamedExports(statement.exportClause) ? statement.exportClause.elements : undefined;
      part.tipTyped = statement.isTypeOnly || Boolean(elements && elements.length > 0 && elements.every((element) => element.isTypeOnly));
      if (statement.exportClause && ts.isNamespaceExport(statement.exportClause)) {
        // `export * as ns from`: its symbol's flag already reads the statement's modifier at the tip.
      }
      for (const element of elements ?? []) {
        add(element.name.text, element.isTypeOnly, element.name);
        if (statement.isTypeOnly && !element.isTypeOnly) {
          totals.symbolsGained += 1;
          example("symbolsGained", `${file}: ${element.name.text} (re-exported)`);
        }
      }
    }
    const group = groups.get(key) ?? { resolved: resolved !== undefined, parts: [] };
    group.parts.push(part);
    groups.set(key, group);
  }

  for (const [key, group] of groups) {
    const tip = group.parts[0].tipTyped;
    const entirely = (part: Part, typed: Set<string>): boolean => part.statementTyped || (part.names.length > 0 && part.names.every((name) => typed.has(name)));
    const lineOf = (names: string[] | undefined, which: "written" | "elided"): boolean =>
      names === undefined
        ? group.parts.every((part) => entirely(part, part[which]))
        : names.every((name) => group.parts.every((part) => !part.names.includes(name) || part[which].has(name)));
    const names = Array.from(new Set(group.parts.flatMap((part) => part.names))).sort();
    const lines: Array<{ label: string; names: string[] | undefined }> =
      group.resolved && names.length > 0 ? names.map((name) => ({ label: `${key}#${name}`, names: [name] })) : [{ label: key, names: undefined }];
    for (const line of lines) {
      const written = lineOf(line.names, "written");
      const elided = lineOf(line.names, "elided");
      totals.lines += 1;
      if (tip) totals.tip += 1;
      if (written) totals.written += 1;
      if (elided) totals.elided += 1;
      if (written && !tip) {
        totals.gained += 1;
        example("gained", `${file} → ${line.label}`);
      }
      if (tip && !written) {
        totals.lost += 1;
        example("lost", `${file} → ${line.label}`);
      }
      if (elided && !written) {
        totals.elidedBeyondWritten += 1;
        example("elidedBeyondWritten", `${file} → ${line.label}`);
      }
    }
  }
}
console.log(JSON.stringify({ label, ...totals, examples }, null, 1));
