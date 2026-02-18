import * as path from "node:path";
import { pathToFileURL } from "node:url";

import { RelationshipHint } from "@live-documentation/shared/inference/fallbackInference";

import { fileExists } from "./directoryScanner";

/** Contextual inputs for the `@link` directive extraction pass. */
export interface LinkHintContext {
  content: string;
  sourceFile: string;
  sourceUri: string;
  workspaceRoot: string;
}

const LINK_DIRECTIVE = /@link\s+([^\s]+)/g;

/**
 * Extracts relationship hints from `@link` directives in file content.
 */
export async function extractLinkHints(context: LinkHintContext): Promise<RelationshipHint[]> {
  const matches: RelationshipHint[] = [];
  let directive: RegExpExecArray | null;

  while ((directive = LINK_DIRECTIVE.exec(context.content)) !== null) {
    const rawReference = directive[1]?.trim();
    if (!rawReference || isExternalReference(rawReference)) {
      continue;
    }

    const targetPath = await resolveReferencePath(rawReference, context);
    if (!targetPath) {
      continue;
    }

    const targetUri = pathToFileURL(targetPath).toString();
    matches.push({
      sourceUri: targetUri,
      targetUri: context.sourceUri,
      kind: "documents",
      confidence: 0.9,
      rationale: `@link ${rawReference} directive`
    });
  }

  LINK_DIRECTIVE.lastIndex = 0;
  return matches;
}

/**
 * Extracts relationship hints from string-literal path references.
 */
export async function extractPathReferenceHints(context: LinkHintContext): Promise<RelationshipHint[]> {
  // Heuristic: string-literal paths like './templates/x', '../docs/y', '/absolute/z', or containing
  // key folders (docs, templates) or known extensions (.md, .hbs, .json).
  const PATH_LIKE = /["'`]([^"'`\n]*\/(?:[^"'`\n]+))["'`]/g;
  const candidates: RelationshipHint[] = [];
  let match: RegExpExecArray | null;

  while ((match = PATH_LIKE.exec(context.content)) !== null) {
    const ref = (match[1] ?? "").trim();
    if (!ref || isExternalReference(ref)) continue;
    // Throttle obvious non-paths: require slash and filter out common URL-like prefixes handled elsewhere
    if (!ref.includes("/")) continue;

    // Light relevance filter to cut false positives
    const lowered = ref.toLowerCase();
    const looksRelevant =
      lowered.startsWith("./") ||
      lowered.startsWith("../") ||
      lowered.startsWith("/") ||
      lowered.includes("docs/") ||
      lowered.includes("templates/") ||
      /\.(md|mdx|markdown|hbs|ejs|njk|liquid|json|yaml|yml|txt)$/i.test(lowered);
    if (!looksRelevant) continue;

    const targetPath = await resolveReferencePath(ref, context);
    if (!targetPath) continue;

    const targetUri = pathToFileURL(targetPath).toString();
    candidates.push({
      sourceUri: targetUri,
      targetUri: context.sourceUri,
      kind: "documents",
      confidence: 0.75,
      rationale: `string path reference ${ref}`
    });
  }

  PATH_LIKE.lastIndex = 0;

  const resolveHints = await extractPathFunctionHints(context);
  candidates.push(...resolveHints);

  return candidates;
}

/**
 * Returns true if the reference appears to be an external URL.
 */
export function isExternalReference(reference: string): boolean {
  return /^(https?:)?\/\//i.test(reference);
}

/**
 * Attempts to resolve a path reference to an absolute file path.
 */
export async function resolveReferencePath(
  reference: string,
  context: LinkHintContext
): Promise<string | undefined> {
  const normalized = reference.replace(/\\/g, "/");
  const candidates = new Set<string>();
  candidates.add(path.resolve(path.dirname(context.sourceFile), normalized));
  candidates.add(path.resolve(context.workspaceRoot, normalized.replace(/^\.\//, "")));

  if (!path.extname(normalized)) {
    const extensions = [".md", ".markdown", ".mdx", ".txt"];
    for (const ext of extensions) {
      candidates.add(path.resolve(path.dirname(context.sourceFile), `${normalized}${ext}`));
      candidates.add(path.resolve(context.workspaceRoot, `${normalized}${ext}`));
    }
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * Extracts hints from path.resolve/path.join function calls with string literals.
 */
async function extractPathFunctionHints(context: LinkHintContext): Promise<RelationshipHint[]> {
  const hints: RelationshipHint[] = [];
  const FUNCTION_PATTERN = /\b(?:path\.)?(resolve|join)\s*\(/gi;
  let match: RegExpExecArray | null;

  while ((match = FUNCTION_PATTERN.exec(context.content)) !== null) {
    const openParenIndex = match.index + match[0].lastIndexOf("(");
    const closeParenIndex = findMatchingParen(context.content, openParenIndex);
    if (closeParenIndex === -1) {
      continue;
    }

    const argsSegment = context.content.slice(openParenIndex + 1, closeParenIndex);
    const literalMatches = Array.from(argsSegment.matchAll(/["'`]([^"'`]+)["'`]/g)).map(
      (value) => value[1].trim()
    );
    if (!literalMatches.length) {
      continue;
    }

    const joined = literalMatches.join("/");
    const candidateRefs = new Set<string>();
    if (joined) {
      candidateRefs.add(joined);
    }

    if (literalMatches.length > 1) {
      candidateRefs.add(`${literalMatches[0]}/${literalMatches.slice(1).join("/")}`);
    }

    for (const ref of candidateRefs) {
      const targetPath = await resolveReferencePath(ref, context);
      if (!targetPath) {
        continue;
      }

      const targetUri = pathToFileURL(targetPath).toString();
      hints.push({
        sourceUri: targetUri,
        targetUri: context.sourceUri,
        kind: "documents",
        confidence: 0.7,
        rationale: `${match[1]} string reference ${ref}`
      });
    }
  }

  return hints;
}

/**
 * Finds the index of the closing parenthesis matching the one at openIndex.
 */
function findMatchingParen(source: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    const char = source[i];
    if (char === "(") {
      depth++;
    } else if (char === ")") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}
