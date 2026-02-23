// Live Documentation: .mdmd/layer-4/tooling/documentationLinkBridge.mdmd.md#implementation-surface
import { globSync } from "glob";
import fs from "node:fs";
import path from "node:path";

import { createSlugger } from "./githubSlugger";
import { extractReferenceDefinitions } from "./markdownShared";
import { normalizeWorkspacePath } from "./pathUtils";

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const CODE_MARKER_PATTERN = /<!--\s*(?:mdmd|live-docs):code\s+([^>\s]+)\s*-->/i;
const INLINE_LINK_PATTERN = /\[[^\]]+\]\(([^)]+)\)/g;
const REFERENCE_LINK_PATTERN = /\[[^\]]+\]\[([^\]]*)\]/g;
const EXTERNAL_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Declares a bidirectional mapping between documentation files and code files.
 *
 * Each rule identifies which doc globs contain `live-docs:code` (or legacy `mdmd:code`)
 * markers pointing at files matched by `codeGlobs`, enabling the enforcement bridge to
 * verify that breadcrumb comments exist in source files.
 */
export interface DocumentationRule {
  /** Human-readable label used in breadcrumb comments (e.g. `"Live Documentation"`). */
  label: string;
  /** Glob patterns matching documentation files to scan for anchors. */
  docGlobs: string[];
  /** Glob patterns matching code files eligible for breadcrumb enforcement. */
  codeGlobs: string[];
}

/**
 * Built-in rule set mapping Live Documentation files to source code
 * under `packages/` and `scripts/`.
 *
 * Includes both the default layout (`.live-documentation/source/`)  and the
 * MDMD-convention layout (`.mdmd/layer-4/`) used by this workspace.
 */
export const DEFAULT_RULES: DocumentationRule[] = [
  {
    label: "Live Documentation",
    docGlobs: [
      ".mdmd/layer-4/**/*.mdmd.md",
      ".live-documentation/source/**/*.md"
    ],
    codeGlobs: [
      "packages/**/*.{ts,tsx,js,jsx,cts,mts,mjs,cjs}",
      "scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      "tests/**/*.{ts,tsx,js,jsx}"
    ]
  }
];

/**
 * Parsed heading anchor within a documentation file, enriched with
 * the code paths it covers and backlinks it contains.
 */
export interface DocumentationAnchorSummary {
  /** Raw heading text. */
  heading: string;
  /** GitHub-compatible slug derived from the heading. */
  slug: string;
  /** Heading depth (1–6). */
  level: number;
  /** 1-based line number where the heading appears. */
  startLine: number;
  /** Workspace-relative paths of code files referenced via `live-docs:code` markers. */
  codePaths: string[];
  /** Workspace-relative paths of files linked back from beneath this heading. */
  backlinks: string[];
}

interface ParsedDocumentationAnchors {
  docPath: string;
  absolutePath: string;
  anchors: DocumentationAnchorSummary[];
}

/**
 * A parsed documentation file's anchors annotated with the rule that produced them.
 */
export interface DocumentationDocumentAnchors extends ParsedDocumentationAnchors {
  rule: DocumentationRule;
}

/**
 * A fully resolved mapping from a code file to the documentation section
 * that describes it, including backlink status.
 */
export interface ResolvedDocumentationTarget {
  /** The rule that produced this mapping. */
  rule: DocumentationRule;
  /** Human-readable label from the rule. */
  label: string;
  /** Workspace-relative path to the documentation file. */
  docPath: string;
  /** Absolute path to the documentation file. */
  docAbsolutePath: string;
  /** Slug of the heading section covering this code file. */
  slug: string;
  /** Raw heading text. */
  heading: string;
  /** Whether the documentation section contains a link back to the code file. */
  hasBacklink: boolean;
}

/** Maps workspace-relative code file paths to their resolved documentation targets. */
export type DocumentationTargetMap = Map<string, ResolvedDocumentationTarget>;

/** Options for {@link parseDocumentationAnchors}. */
export interface ParseDocumentationAnchorsOptions {
  /** Absolute path to the workspace root for relative-path resolution. */
  workspaceRoot: string;
  /** Optional pre-loaded file content; read from disk when omitted. */
  content?: string;
}

/**
 * A single violation detected by the documentation-link enforcement pass.
 */
export interface DocumentationLinkViolation {
  /** Violation category. */
  kind:
    | "missing-code-file"
    | "unsupported-comment-style"
    | "missing-doc-backlink"
    | "missing-breadcrumb"
    | "mismatched-breadcrumb"
    | "rule-mismatch";
  /** Workspace-relative path of the code file involved. */
  filePath: string;
  /** Workspace-relative path of the documentation file. */
  docPath: string;
  /** Heading slug identifying the relevant documentation section. */
  slug: string;
  /** Rule label that produced this violation. */
  label: string;
  /** Expected breadcrumb comment (when applicable). */
  expected?: string;
  /** Actual comment found in the file (when applicable). */
  actual?: string;
  /** Human-readable description of the violation. */
  message: string;
}

/**
 * Aggregate result from a documentation-link enforcement run.
 */
export interface DocumentationLinkEnforcementResult {
  /** Number of documentation files scanned for anchors. */
  scannedDocuments: number;
  /** Number of code files checked for breadcrumb comments. */
  scannedFiles: number;
  /** Number of code files auto-fixed (when `fix` is enabled). */
  fixedFiles: number;
  /** All violations detected during the run. */
  violations: DocumentationLinkViolation[];
}

/** Options for {@link runDocumentationLinkEnforcement}. */
export interface RunDocumentationLinkEnforcementOptions {
  /** Absolute path to the workspace root. */
  workspaceRoot: string;
  /** Custom rules; defaults to {@link DEFAULT_RULES} when omitted. */
  rules?: DocumentationRule[];
  /** When `true`, auto-fix missing or mismatched breadcrumb comments. */
  fix?: boolean;
  /** Optional allowlist of workspace-relative code paths to check. */
  includeList?: string[];
}

/**
 * Parses heading anchors from a documentation file, collecting
 * `live-docs:code` markers and inline backlinks for each section.
 *
 * @param docPath - Workspace-relative path to the documentation file.
 * @param options - Workspace root and optional pre-loaded content.
 * @returns Parsed anchors with code paths and backlinks.
 */
export function parseDocumentationAnchors(
  docPath: string,
  { workspaceRoot, content }: ParseDocumentationAnchorsOptions
): ParsedDocumentationAnchors {
  const absolutePath = path.resolve(workspaceRoot, docPath);
  const raw = content ?? fs.readFileSync(absolutePath, "utf8");
  const lines = raw.split(/\r?\n/);

  const slugger = createSlugger();
  const definitions = extractReferenceDefinitions(raw);

  const anchors: DocumentationAnchorSummary[] = [];
  let currentAnchorIndex = -1;

  lines.forEach((line, index) => {
    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      const [, hashes, headingText] = headingMatch;
      const level = hashes.length;
      const slug = slugger.slug(headingText.trim());
      anchors.push({
        heading: headingText.trim(),
        slug,
        level,
        startLine: index + 1,
        codePaths: [],
        backlinks: []
      });
      currentAnchorIndex = anchors.length - 1;
      return;
    }

    if (currentAnchorIndex === -1) {
      return;
    }

    const markerMatch = line.match(CODE_MARKER_PATTERN);
    if (markerMatch) {
      const codePath = resolveWorkspaceRelativePath(markerMatch[1].trim(), workspaceRoot);
      if (codePath && !anchors[currentAnchorIndex].codePaths.includes(codePath)) {
        anchors[currentAnchorIndex].codePaths.push(codePath);
      }
      return;
    }

    collectInlineBacklinks(
      line,
      absolutePath,
      workspaceRoot,
      definitions,
      anchors[currentAnchorIndex]
    );
  });

  return { docPath: normalizeWorkspacePath(docPath), absolutePath, anchors };
}

/**
 * Builds a code-file-to-documentation-target map from parsed documents.
 *
 * When a code file appears under multiple anchors, the mapping prefers
 * the anchor that contains a backlink to the code file.
 *
 * @param documents - Parsed documentation files with rule metadata.
 * @param targetMap - Optional existing map to merge into.
 * @returns The (mutated) target map.
 */
export function resolveCodeToDocumentationMap(
  documents: DocumentationDocumentAnchors[],
  targetMap: DocumentationTargetMap = new Map()
): DocumentationTargetMap {
  for (const document of documents) {
    for (const anchor of document.anchors) {
      for (const codePath of anchor.codePaths) {
        const existing = targetMap.get(codePath);
        const hasBacklink = anchor.backlinks.includes(codePath);
        const target: ResolvedDocumentationTarget = {
          rule: document.rule,
          label: document.rule.label,
          docPath: document.docPath,
          docAbsolutePath: document.absolutePath,
          slug: anchor.slug,
          heading: anchor.heading,
          hasBacklink
        };

        if (!existing) {
          targetMap.set(codePath, target);
          continue;
        }

        if (!existing.hasBacklink && hasBacklink) {
          targetMap.set(codePath, target);
        }
      }
    }
  }

  return targetMap;
}

/**
 * Formats a breadcrumb comment string for a given code file and target.
 *
 * The comment is intended to appear as the first line of the code file,
 * pointing back to the documentation section that describes it.
 *
 * @param filePath - Workspace-relative path to the code file.
 * @param target - Resolved documentation target with label and slug.
 * @returns Formatted comment string (e.g. `// Live Documentation: path.mdmd.md#slug`).
 * @throws If the file extension does not support line comments.
 */
export function formatDocumentationLinkComment(
  filePath: string,
  target: ResolvedDocumentationTarget
): string {
  const extension = path.extname(filePath).toLowerCase();
  const prefix = resolveLineCommentPrefix(extension);
  if (!prefix) {
    throw new Error(`Unsupported documentation comment style for ${extension}`);
  }

  return `${prefix} ${target.label}: ${target.docPath}#${target.slug}`;
}

/**
 * Runs the full documentation-link enforcement pass across the workspace.
 *
 * Scans documentation files for `live-docs:code` (or legacy `mdmd:code`) markers, resolves them to code
 * files, and verifies that each code file contains the correct breadcrumb
 * comment pointing back to its documentation section. Optionally auto-fixes.
 *
 * @param options - Workspace root, rules, fix mode, and optional include list.
 * @returns Aggregate enforcement result with violations.
 */
export function runDocumentationLinkEnforcement(
  options: RunDocumentationLinkEnforcementOptions
): DocumentationLinkEnforcementResult {
  const { workspaceRoot, fix = false, includeList } = options;
  const rules = options.rules?.length ? options.rules : DEFAULT_RULES;

  const documentsByRule = new Map<DocumentationRule, DocumentationDocumentAnchors[]>();
  const codeFilesByRule = new Map<DocumentationRule, Set<string>>();
  const aggregatedTargets: DocumentationTargetMap = new Map();

  for (const rule of rules) {
    const docPaths = collectFiles(workspaceRoot, rule.docGlobs);
    const documents = docPaths.map((docPath) => ({
      ...parseDocumentationAnchors(docPath, { workspaceRoot }),
      rule
    }));
    documentsByRule.set(rule, documents);
    resolveCodeToDocumentationMap(documents, aggregatedTargets);

    const codePaths = collectFiles(workspaceRoot, rule.codeGlobs);
    codeFilesByRule.set(rule, new Set(codePaths));
  }

  const targetFiles = includeList ?? Array.from(aggregatedTargets.keys());

  let scannedFiles = 0;
  let fixedFiles = 0;
  const violations: DocumentationLinkViolation[] = [];

  for (const codePath of targetFiles) {
    const target = aggregatedTargets.get(codePath);
    if (!target) {
      continue;
    }

    const absolutePath = path.resolve(workspaceRoot, codePath);
    if (!fs.existsSync(absolutePath)) {
      violations.push({
        kind: "missing-code-file",
        filePath: codePath,
        docPath: target.docPath,
        slug: target.slug,
        label: target.label,
        message: `Code file missing on disk for documentation section ${target.docPath}#${target.slug}`
      });
      continue;
    }

    const allowedFiles = codeFilesByRule.get(target.rule);
    if (!allowedFiles || !allowedFiles.has(codePath)) {
      violations.push({
        kind: "rule-mismatch",
        filePath: codePath,
        docPath: target.docPath,
        slug: target.slug,
        label: target.label,
        message: `Code path ${codePath} is not covered by rule label "${target.label}" code globs.`
      });
      continue;
    }

    const extension = path.extname(codePath).toLowerCase();
    const prefix = resolveLineCommentPrefix(extension);
    if (!prefix) {
      violations.push({
        kind: "unsupported-comment-style",
        filePath: codePath,
        docPath: target.docPath,
        slug: target.slug,
        label: target.label,
        message: `Unable to infer documentation comment style for ${extension}.`
      });
      continue;
    }

    scannedFiles += 1;

    if (!target.hasBacklink) {
      violations.push({
        kind: "missing-doc-backlink",
        filePath: codePath,
        docPath: target.docPath,
        slug: target.slug,
        label: target.label,
        message: `Documentation section ${target.docPath}#${target.slug} lacks a link back to ${codePath}.`
      });
    }

    const expectedComment = `${prefix} ${target.label}: ${target.docPath}#${target.slug}`;
    const result = ensureDocumentationComment(absolutePath, expectedComment, prefix, target.label, fix);

    if (!result.ok) {
      violations.push({
        kind: result.kind,
        filePath: codePath,
        docPath: target.docPath,
        slug: target.slug,
        label: target.label,
        expected: expectedComment,
        actual: result.actual,
        message: result.message
      });
    }

    if (result.updated) {
      fixedFiles += 1;
    }
  }

  let scannedDocuments = 0;
  for (const documents of documentsByRule.values()) {
    scannedDocuments += documents.length;
  }

  return {
    scannedDocuments,
    scannedFiles,
    fixedFiles,
    violations
  };
}

interface EnsureResult {
  ok: boolean;
  kind: "missing-breadcrumb" | "mismatched-breadcrumb";
  actual?: string;
  message: string;
  updated: boolean;
}

function ensureDocumentationComment(
  absolutePath: string,
  expected: string,
  prefix: string,
  label: string,
  fix: boolean
): EnsureResult {
  const raw = fs.readFileSync(absolutePath, "utf8");
  const hadBom = raw.charCodeAt(0) === 0xfeff;
  const newline = raw.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(/\r?\n/);

  if (hadBom && lines.length > 0) {
    lines[0] = lines[0].slice(1);
  }

  let cursor = 0;
  if (lines[cursor]?.startsWith("#!")) {
    cursor += 1;
  }

  let insertionIndex = lines.length;
  let commentIndex: number | undefined;
  let commentValue: string | undefined;

  for (let index = cursor; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith(prefix)) {
      if (trimmed.startsWith(`${prefix} ${label}:`)) {
        commentIndex = index;
        commentValue = line;
        break;
      }
      continue;
    }

    insertionIndex = index;
    break;
  }

  if (commentIndex === undefined) {
    if (!fix) {
      return {
        ok: false,
        kind: "missing-breadcrumb",
        actual: undefined,
        message: `Missing ${label} comment near the top of the file.`,
        updated: false
      };
    }

    const targetIndex = insertionIndex === lines.length ? lines.length : insertionIndex;
    lines.splice(targetIndex, 0, expected);

    if (hadBom) {
      lines[0] = "\ufeff" + lines[0];
    }

    fs.writeFileSync(absolutePath, lines.join(newline));

    return {
      ok: true,
      kind: "missing-breadcrumb",
      actual: expected,
      message: "",
      updated: true
    };
  }

  const actual = commentValue ?? "";
  if (actual.trim() === expected.trim()) {
    if (hadBom) {
      lines[0] = "\ufeff" + lines[0];
    }
    return {
      ok: true,
      kind: "missing-breadcrumb",
      actual,
      message: "",
      updated: false
    };
  }

  if (!fix) {
    return {
      ok: false,
      kind: "mismatched-breadcrumb",
      actual,
      message: `${label} comment does not match expected target.`,
      updated: false
    };
  }

  lines.splice(commentIndex, 1, expected);

  if (hadBom) {
    lines[0] = "\ufeff" + lines[0];
  }

  fs.writeFileSync(absolutePath, lines.join(newline));

  return {
    ok: true,
    kind: "missing-breadcrumb",
    actual: expected,
    message: "",
    updated: true
  };
}

function collectInlineBacklinks(
  line: string,
  absoluteDocPath: string,
  workspaceRoot: string,
  definitions: Map<string, { index: number; url: string }>,
  anchor: DocumentationAnchorSummary
): void {
  for (const match of line.matchAll(INLINE_LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > 0 && line[index - 1] === "!") {
      continue;
    }
    const candidate = match[1];
    const resolved = resolveDocLink(candidate, absoluteDocPath, workspaceRoot);
    if (resolved) {
      pushUnique(anchor.backlinks, resolved);
    }
  }

  for (const match of line.matchAll(REFERENCE_LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > 0 && line[index - 1] === "!") {
      continue;
    }
    const referenceId = (match[1] || "").trim().toLowerCase();
    if (!referenceId) {
      continue;
    }

    const definition = definitions.get(referenceId);
    if (!definition) {
      continue;
    }

    const resolved = resolveDocLink(definition.url, absoluteDocPath, workspaceRoot);
    if (resolved) {
      pushUnique(anchor.backlinks, resolved);
    }
  }
}

function resolveDocLink(
  target: string,
  absoluteDocPath: string,
  workspaceRoot: string
): string | undefined {
  let sanitized = target.trim();
  if (!sanitized || sanitized.startsWith("#")) {
    return undefined;
  }

  if (EXTERNAL_SCHEME_PATTERN.test(sanitized)) {
    return undefined;
  }

  sanitized = stripFragmentAndQuery(sanitized);

  let decoded: string;
  try {
    decoded = decodeURI(sanitized);
  } catch {
    decoded = sanitized;
  }

  const docDir = path.dirname(absoluteDocPath);
  const resolvedPath = decoded.startsWith("/")
    ? path.resolve(workspaceRoot, `.${decoded}`)
    : path.resolve(docDir, decoded);
  const relative = path.relative(workspaceRoot, resolvedPath);
  if (!relative || relative.startsWith("..")) {
    return undefined;
  }

  return normalizeWorkspacePath(relative);
}

function resolveWorkspaceRelativePath(candidate: string, workspaceRoot: string): string | undefined {
  const decoded = decodeCandidate(candidate);
  const absolute = path.resolve(workspaceRoot, decoded);
  const relative = path.relative(workspaceRoot, absolute);
  if (!relative || relative.startsWith("..")) {
    return undefined;
  }
  return normalizeWorkspacePath(relative);
}

function decodeCandidate(candidate: string): string {
  let value = candidate.trim();
  if (value.startsWith("./")) {
    value = value.slice(2);
  }
  return value;
}

function collectFiles(workspaceRoot: string, patterns: string[]): string[] {
  const results = new Set<string>();

  for (const pattern of patterns) {
    const matches = globSync(pattern, {
      cwd: workspaceRoot,
      nodir: true,
      dot: false
    });

    for (const match of matches) {
      results.add(normalizeWorkspacePath(match));
    }
  }

  return Array.from(results).sort();
}

function resolveLineCommentPrefix(extension: string): string | undefined {
  switch (extension) {
    case ".ts":
    case ".tsx":
    case ".js":
    case ".jsx":
    case ".cts":
    case ".mts":
    case ".mjs":
    case ".cjs":
      return "//";
    default:
      return undefined;
  }
}

function stripFragmentAndQuery(target: string): string {
  let value = target;
  const hashIndex = value.indexOf("#");
  if (hashIndex !== -1) {
    value = value.slice(0, hashIndex);
  }
  const queryIndex = value.indexOf("?");
  if (queryIndex !== -1) {
    value = value.slice(0, queryIndex);
  }
  return value;
}

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) {
    list.push(value);
  }
}
