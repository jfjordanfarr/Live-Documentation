/**
 * SQL scripts (`.sql`).
 *
 * The procedures, tables, views and functions a script creates are its public
 * symbols; a table a procedure's body creates when it runs is not. The
 * objects it names after `FROM`, `JOIN`, `INSERT`, `EXEC` and their kin, and
 * the functions it calls, are its dependencies, matched by name to the
 * scripts that create them, a one-part name bound as T-SQL binds it (its
 * module's schema, then `dbo`): a name in the same database is read from source,
 * and a name reached through a linked server is an edge observed from a
 * contract, since only the name ties the two databases together. A name
 * nothing in the scan creates is kept as written, a contract by name, so that
 * a map can show a door to something outside the scan and a map of several
 * scans can match it; the database engine's own catalog is never kept.
 */
import path from "node:path";

import { compareText } from "../../tooling/compareText";
import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import { readSourceText } from "../../tooling/sourceText";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult } from "../core";
import { bindSqlName, matchSqlObject, readSql, sqlNameMatches, sqlObjectName, tsqltTestClasses } from "../openings";
import type { LanguageAdapter } from "./index";

/** Language adapter for SQL scripts: created objects as symbols, named objects as dependencies. */
export const sqlAdapter: LanguageAdapter = {
  id:         "sql",
  extensions: [".sql"],
  async analyze({ absolutePath, workspaceRoot, fileIndex, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const content  = await readSourceText(absolutePath, fileIndex);
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));

    const { declarations, references } = readSql(content);
    const symbols: PublicSymbolEntry[] = declarations.filter((declaration) => !declaration.inBody).map((declaration) => ({
      name:     declaration.name,
      kind:     declaration.kind,
      location: { line: declaration.line, character: 1 }
    }));

    const own        = declarations.map((declaration) => ({ name: declaration.name, ...sqlObjectName(declaration.name), sourcePath: thisFile }));
    const source     = new Map<string, Set<string>>();
    const contract   = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    for (const reference of references) {
      const matches = [
        ...(symbolIndex ? matchSqlObject(reference.name, symbolIndex).map((object) => ({ name: object.name, parts: object.parts, sourcePath: object.location.sourcePath })) : []),
        ...own.filter((created) => sqlNameMatches(reference.name, created))
      ];
      const bound = bindSqlName(reference, matches);
      if (bound.length === 0) unresolved.add(reference.raw);
      for (const object of bound) {
        if (object.sourcePath === thisFile) continue;
        const bucket = reference.name.linked ? contract : source;
        const names  = bucket.get(object.sourcePath) ?? new Set<string>();
        names.add(object.name);
        bucket.set(object.sourcePath, names);
      }
    }

    const entries = (bucket: Map<string, Set<string>>, basis?: "contract"): DependencyEntry[] =>
      Array.from(bucket.entries())
        .sort(([left], [right]) => compareText(left, right))
        .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const, ...(basis ? { basis } : {}) }));

    const named = Array.from(unresolved).sort().map((specifier): DependencyEntry => ({ specifier, symbols: [], kind: "import", basis: "contract" }));
    const result: SourceAnalysisResult = { symbols, dependencies: [...entries(source), ...entries(contract, "contract"), ...named] };
    // tSQLt's tests: the schemas this script makes test classes, and those in which it creates a `test…` procedure; the
    // first pass puts the two together across scripts, since a class may be made in another script than its tests.
    const testClasses = tsqltTestClasses(content);
    const testProcedureSchemas = [...new Set(declarations.filter((declaration) => declaration.kind === "procedure" && !declaration.inBody)
      .map((declaration) => sqlObjectName(declaration.name).parts)
      .filter((parts) => parts.length >= 2 && /^test/iu.test(parts[parts.length - 1]))
      .map((parts) => parts[parts.length - 2].toLowerCase()))];
    if (testClasses.length > 0 || testProcedureSchemas.length > 0) {
      result.tests = { ...(testClasses.length > 0 ? { testClasses } : {}), ...(testProcedureSchemas.length > 0 ? { testProcedureSchemas } : {}) };
    }
    return result;
  }
};
