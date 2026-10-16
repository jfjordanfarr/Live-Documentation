/**
 * Go module files (`go.mod`): the module a file names and the modules it
 * requires.
 *
 * @remarks
 * The module is the `module` path. The dependencies are the `require`
 * directives, in the single-line and the block forms, each written as
 * `path@version`; a requirement marked `// indirect` is one the module's own
 * code does not import, recorded for a dependency's sake, and is not written.
 * A `replace` whose target is a folder (`=> ./local`, `=> ../lib`) links the
 * requirement to the `go.mod` in that folder when the workspace holds it,
 * written as the module's path alone when it does not; one whose target is
 * another module (`=> other vX`) writes the replacement in the requirement's
 * place. A requirement on a module a workspace `go.mod` publishes is linked to
 * it. `exclude`, `retract`, `toolchain`, `godebug` and `tool` directives are
 * not read, and a `go.mod` declares no entries: a Go program starts at its
 * `package main`, which the Go adapter marks.
 *
 * @module
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import type { SourceAnalysisResult } from "../coreTypes";
import type { LanguageAdapter } from "./index";
import { ManifestDependencies, manifestContext, manifestIn, packageSymbols, publishedName } from "./manifest";

const GO_MOD = "go.mod";

/** One directive of a `go.mod`: its verb, its arguments unquoted, and whether its comment marks it indirect. */
export interface GoDirective {
  verb: string;
  args: string[];
  indirect: boolean;
}

/** What a `go.mod` says, as far as the docs need it. */
export interface GoModFile {
  module?: string;
  requires: Array<{ path: string; version: string }>;
  replaces: Array<{ path: string; version?: string; target: string; targetVersion?: string }>;
}

/** Reads a `go.mod` into its directives, a block's lines each given the block's verb. */
export function goDirectives(text: string): GoDirective[] {
  const directives: GoDirective[] = [];
  let block: string | undefined;
  for (const line of text.split(/\r?\n/u)) {
    const comment = line.indexOf("//");
    const code = (comment === -1 ? line : line.slice(0, comment)).trim();
    const indirect = comment !== -1 && /^\/\/\s*indirect\b/u.test(line.slice(comment).split(";")[0]);
    if (block !== undefined) {
      if (code === ")") {
        block = undefined;
      } else if (code) {
        directives.push({ verb: block, args: tokens(code), indirect });
      }
      continue;
    }
    if (!code) continue;
    const [verb, ...rest] = tokens(code);
    if (rest.length === 1 && rest[0] === "(") {
      block = verb;
    } else {
      directives.push({ verb, args: rest, indirect });
    }
  }
  return directives;
}

/** The words of a directive, a quoted path (`"..."` or a backquoted one) unquoted. */
function tokens(code: string): string[] {
  return (code.match(/"(?:[^"\\]|\\.)*"|`[^`]*`|\(|\)|[^\s()"`]+/gu) ?? []).map((token) =>
    token.startsWith("\"") ? (JSON.parse(token) as string) : token.startsWith("`") ? token.slice(1, -1) : token);
}

/** The module, its direct requirements and its replacements. */
export function readGoMod(text: string): GoModFile {
  const file: GoModFile = { requires: [], replaces: [] };
  for (const directive of goDirectives(text)) {
    const args = directive.args;
    if (directive.verb === "module" && args[0]) {
      file.module = args[0];
    } else if (directive.verb === "require" && args.length >= 2 && !directive.indirect) {
      file.requires.push({ path: args[0], version: args[1] });
    } else if (directive.verb === "replace") {
      const arrow = args.indexOf("=>");
      if (arrow < 1 || arrow > 2 || !args[arrow + 1]) continue;
      file.replaces.push({ path: args[0], version: arrow === 2 ? args[1] : undefined, target: args[arrow + 1], targetVersion: args[arrow + 2] });
    }
  }
  return file;
}

/** True for a replacement that names a folder rather than a module, as Go tells them: a path starting `./`, `../` or `/`, or a Windows drive. */
function isFolder(target: string): boolean {
  return /^(?:\.\.?[/\\]|\/|[A-Za-z]:[/\\])/u.test(target);
}

/** Language adapter for `go.mod`: the module as a symbol and the modules it requires as dependencies. */
export const goModAdapter: LanguageAdapter = {
  id:         "go-mod",
  extensions: [],
  fileNames:  [GO_MOD],
  async analyze(input): Promise<SourceAnalysisResult | null> {
    const goMod = readGoMod(await fs.readFile(input.absolutePath, "utf8"));
    const context = manifestContext(input);
    const directory = path.dirname(input.absolutePath);
    const dependencies = new ManifestDependencies();
    for (const requirement of goMod.requires) {
      const replacement = goMod.replaces.find((replace) => replace.path === requirement.path && (replace.version === undefined || replace.version === requirement.version));
      if (replacement && isFolder(replacement.target)) {
        const linked = manifestIn(replacement.target, directory, GO_MOD, context);
        if (linked) {
          dependencies.link(linked, publishedName(linked, requirement.path, context));
        } else {
          dependencies.externalPackage(requirement.path);
        }
      } else if (replacement) {
        dependencies.byName(replacement.target, replacement.targetVersion, GO_MOD, context);
      } else {
        dependencies.byName(requirement.path, requirement.version, GO_MOD, context);
      }
    }
    return { symbols: packageSymbols(goMod.module), dependencies: dependencies.entries() };
  }
};
