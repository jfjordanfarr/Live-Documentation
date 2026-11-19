/**
 * SQL scripts (`.sql`).
 *
 * The procedures, tables, views and functions a script creates are its public
 * symbols; a table a procedure's body creates when it runs is not. The
 * objects it names after `FROM`, `JOIN`, `INSERT`, `EXEC` and their kin, and
 * the functions it calls, are its dependencies, matched by name to the
 * scripts that create them: a name in the same database is read from source,
 * and a name reached through a linked server is an edge observed from a
 * contract, since only the name ties the two databases together. A name
 * nothing in the scan creates is kept as written, a contract by name, so that
 * a map can show a door to something outside the scan and a map of several
 * scans can match it; the database engine's own catalog is never kept.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { compareText } from "../../tooling/compareText";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult } from "../core";
import { matchSqlObject, readSql, sqlNameMatches, sqlObjectName } from "../openings";
import type { LanguageAdapter } from "./index";

/** Language adapter for SQL scripts: created objects as symbols, named objects as dependencies. */
export const sqlAdapter: LanguageAdapter = {
  id:         "sql",
  extensions: [".sql"],
  async analyze({ absolutePath, workspaceRoot, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const content  = await fs.readFile(absolutePath, "utf8");
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));

    const { declarations, references } = readSql(content);
    const symbols: PublicSymbolEntry[] = declarations.filter((declaration) => !declaration.inBody).map((declaration) => ({
      name:     declaration.name,
      kind:     declaration.kind,
      location: { line: declaration.line, character: 1 }
    }));

    const own        = declarations.map((declaration) => sqlObjectName(declaration.name));
    const source     = new Map<string, Set<string>>();
    const contract   = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    for (const reference of references) {
      const declared = symbolIndex ? matchSqlObject(reference.name, symbolIndex) : [];
      if (declared.length === 0) {
        if (!own.some((created) => sqlNameMatches(reference.name, created))) unresolved.add(reference.raw);
        continue;
      }
      for (const object of declared) {
        if (object.location.sourcePath === thisFile) continue;
        const bucket = reference.name.linked ? contract : source;
        const names  = bucket.get(object.location.sourcePath) ?? new Set<string>();
        names.add(object.name);
        bucket.set(object.location.sourcePath, names);
      }
    }

    const entries = (bucket: Map<string, Set<string>>, basis?: "contract"): DependencyEntry[] =>
      Array.from(bucket.entries())
        .sort(([left], [right]) => compareText(left, right))
        .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const, ...(basis ? { basis } : {}) }));

    const named = Array.from(unresolved).sort().map((specifier): DependencyEntry => ({ specifier, symbols: [], kind: "import", basis: "contract" }));
    return { symbols, dependencies: [...entries(source), ...entries(contract, "contract"), ...named] };
  }
};
