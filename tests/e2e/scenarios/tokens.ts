/**
 * Replacement tokens for scenarios: a scenario says `{processor}`, and the harness resolves it against the map in
 * front of it, so that one scenario runs over every Rosetta program by swapping the token table.
 *
 * The token table is the Rosetta manifest (`tests/integration/programs/rosetta-manifest.json`): its canonical parts
 * (main, processor, models, types, helpers, and the tests) and each part's file patterns. A part's patterns are read
 * against the files the map actually holds, so a token never names a file the map does not draw. Pure: the caller
 * passes the manifest and the map's file ids.
 *
 * Three forms:
 * - `{processor}` is the part's subject file, the one a scenario selects or pins;
 * - `{processor/}` is the directory that holds the part and nothing of another production part (Java's
 *   `com/rosetta/processor`, Go's `src/processor`); flat programs have none, and a scenario that needs one is not
 *   applicable to them;
 * - `{processor*}` is every file of the part, for a scenario that retains a part whole.
 */

/** The parts of the manifest's canonical program that tokens name; the tests are a part too, matched first. */
export const PRODUCTION_PARTS = ["main", "processor", "models", "types", "helpers"] as const;
export type Part = (typeof PRODUCTION_PARTS)[number] | "test";

export interface RosettaManifest {
  canonicalProgram: { nodes: Array<{ id: string; files: string[] }>; edges: Array<{ from: string; to: string }> };
  variants: Array<{ language: string; path: string; tier: string; sourceDir: string; entryPoint: string; compilerEdges?: string }>;
}

/** A variant's token table, resolved against one map. */
export interface TokenTable {
  language: string;
  /** What precedes a variant-relative path in the map's ids: "" for a sample built from the program, the program's path for the repository's own map. */
  root: string;
  /** Each part's files, as the map's ids, in path order. */
  files: Record<Part, string[]>;
  /** Each production part's subject file. */
  subject: Partial<Record<Part, string>>;
  /** Each production part's own directory, where it has one. */
  directory: Partial<Record<Part, string>>;
  /** Files of the variant the map holds that no pattern places, so that a gap in the table is seen, not silent. */
  unplaced: string[];
}

export class TokenError extends Error {}

/** A manifest glob (`*` any run of characters, everything else literal) as an anchored, case-insensitive pattern. */
function globPattern(glob: string): RegExp {
  const escaped = glob.split("*").map(piece => piece.replace(/[.+?^${}()|[\]\\]/gu, "\\$&")).join(".*");
  return new RegExp(`^${escaped}$`, "iu");
}

/**
 * Whether a variant-relative path matches one of the manifest's patterns: `name.*` matches the file's own name;
 * `Dir/*` matches a file directly inside a directory of that name. Case is ignored, since the manifest writes one
 * spelling (`main.*`) for files that differ by language (`Main.java`, `Main.cs`).
 */
export function matchesPattern(relative: string, pattern: string): boolean {
  const segments = relative.split("/");
  const name = segments[segments.length - 1];
  const slash = pattern.lastIndexOf("/");
  if (slash < 0) return globPattern(pattern).test(name);
  const directory = segments[segments.length - 2];
  return directory !== undefined && globPattern(pattern.slice(0, slash)).test(directory) && globPattern(pattern.slice(slash + 1)).test(name);
}

const HEADER = /\.(h|hpp|hh|hxx)$/iu;
const stem = (relative: string): string => {
  const name = relative.slice(relative.lastIndexOf("/") + 1);
  return name.slice(0, name.indexOf(".") < 0 ? undefined : name.indexOf(".")).toLowerCase();
};
const directoryOf = (id: string): string => (id.lastIndexOf("/") < 0 ? "" : id.slice(0, id.lastIndexOf("/")));

/**
 * The part's subject file: one named for the part before one that is not (`processor.c` before `Record.java`), an
 * implementation before its header, and the variant's declared entry point for `main`; then path order.
 */
function subjectOf(part: Part, files: readonly string[], entry: string): string | undefined {
  const rank = (id: string): number => (part === "main" && id === entry ? 0 : 4) - (stem(id) === part ? 2 : 0) - (HEADER.test(id) ? 0 : 1);
  return [...files].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))[0];
}

/**
 * Resolves a variant's parts against a map's file ids. `root` is the prefix that turns a variant-relative path into the
 * map's id: "" for a sample built from the program folder, `tests/integration/programs/<language>/rosetta/` on the
 * repository's own map, which holds the programs as samples.
 */
export function tokenTable(manifest: RosettaManifest, language: string, mapIds: readonly string[], root = ""): TokenTable {
  const variant = manifest.variants.find(candidate => candidate.language === language);
  if (!variant) throw new TokenError(`The manifest has no ${language} variant.`);
  const nodes = new Map(manifest.canonicalProgram.nodes.map(node => [node.id, node.files]));
  const relative = mapIds.filter(id => id.startsWith(root)).map(id => id.slice(root.length));
  // Only source files the program carries are parts; the build files, the oracle's expectations and the Live Docs are not.
  const source = relative.filter(path => !path.startsWith("expected/") && /\.[a-z]+$/iu.test(path) && !/\.(json|xml|toml|mod|csproj|md)$/iu.test(path));
  const files = { main: [], processor: [], models: [], types: [], helpers: [], test: [] } as Record<Part, string[]>;
  const unplaced: string[] = [];
  for (const path of source) {
    const match = (part: Part): boolean => (nodes.get(part) ?? []).some(pattern => matchesPattern(path, pattern));
    const part = match("test") ? "test" : PRODUCTION_PARTS.find(match);
    if (part) files[part].push(`${root}${path}`);
    else unplaced.push(`${root}${path}`);
  }
  for (const part of Object.keys(files) as Part[]) files[part].sort();
  const entry = `${root}${variant.entryPoint.slice(variant.path.length + 1)}`;
  const subject: TokenTable["subject"] = {};
  const directory: TokenTable["directory"] = {};
  const production = new Map(PRODUCTION_PARTS.flatMap(part => files[part].map(id => [id, part] as const)));
  for (const part of PRODUCTION_PARTS) {
    const chosen = subjectOf(part, files[part], entry);
    if (chosen) subject[part] = chosen;
    const homes = new Set(files[part].map(directoryOf));
    if (homes.size !== 1) continue;
    const [home] = homes;
    const strangers = [...production].some(([id, other]) => other !== part && directoryOf(id) === home);
    if (!strangers && home !== root.replace(/\/$/u, "")) directory[part] = home;
  }
  return { language, root, files, subject, directory, unplaced };
}

/** One token's value; throws when the table cannot give it, so the scenario is reported not applicable, never guessed. */
function value(token: string, table: TokenTable): string | string[] {
  const form = token.endsWith("/") ? "directory" : token.endsWith("*") ? "all" : "subject";
  const part = (form === "subject" ? token : token.slice(0, -1)) as Part;
  if (!(part in table.files)) throw new TokenError(`{${token}} names no part of the Rosetta program.`);
  if (form === "all") {
    if (table.files[part].length === 0) throw new TokenError(`The ${table.language} map holds no file of ${part}.`);
    return table.files[part];
  }
  const found = form === "directory" ? table.directory[part] : table.subject[part];
  if (found === undefined) throw new TokenError(form === "directory" ? `The ${table.language} program keeps ${part} in no directory of its own.` : `The ${table.language} map holds no file of ${part}.`);
  return found;
}

/** A string with every `{token}` replaced; a token that stands for several files is refused here. */
export function resolveText(template: string, table: TokenTable): string {
  return template.replace(/\{([a-z]+[/*]?)\}/gu, (_, token: string) => {
    const resolved = value(token, table);
    if (Array.isArray(resolved)) throw new TokenError(`{${token}} names several files and cannot stand in one place.`);
    return resolved;
  });
}

/** A list of tokens or literals, each `{part*}` spread into its files. */
export function resolveList(templates: readonly string[], table: TokenTable): string[] {
  return templates.flatMap(template => {
    const whole = /^\{([a-z]+\*)\}$/u.exec(template);
    return whole ? (value(whole[1], table) as string[]) : [resolveText(template, table)];
  });
}
