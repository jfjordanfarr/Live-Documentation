/**
 * SQL scripts (`.sql`).
 *
 * The procedures, tables, views and functions a script creates are its public
 * symbols. The objects it names after `FROM`, `JOIN`, `INSERT INTO`, `EXEC` and
 * their kin are its dependencies, matched by name to the scripts that create
 * them: a name in the same database is read from source, and a name reached
 * through a linked server is an edge observed from a contract, since only the
 * name ties the two databases together.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult } from "../core";
import { matchSqlObject, sqlDeclarations, sqlReferences } from "../openings";
import type { LanguageAdapter } from "./index";

/** Language adapter for SQL scripts: created objects as symbols, named objects as dependencies. */
export const sqlAdapter: LanguageAdapter = {
  id:         "sql",
  extensions: [".sql"],
  async analyze({ absolutePath, workspaceRoot, symbolIndex }): Promise<SourceAnalysisResult | null> {
    const content  = await fs.readFile(absolutePath, "utf8");
    const thisFile = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));

    const symbols: PublicSymbolEntry[] = sqlDeclarations(content).map((declaration) => ({
      name:     declaration.name,
      kind:     declaration.kind,
      location: { line: declaration.line, character: 1 }
    }));

    const source   = new Map<string, Set<string>>();
    const contract = new Map<string, Set<string>>();
    for (const reference of sqlReferences(content)) {
      const declared = symbolIndex ? matchSqlObject(reference.name, symbolIndex) : [];
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
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const, ...(basis ? { basis } : {}) }));

    return { symbols, dependencies: [...entries(source), ...entries(contract, "contract")] };
  }
};
