import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import { isExternalLink, normalizePath } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const CONFIG_APPSETTINGS_PATTERN = /ConfigurationManager\.AppSettings\s*\[/g;
const WEBFORMS_CONTROL_ID_PATTERN = /<asp:[^>]*\bID\s*=\s*"([^"]+)"/gi;
const WEBFORMS_PAGE_DIRECTIVE_PATTERN = /<%@\s*Page\b[^%]*%>/i;
const WEBFORMS_CODE_REFERENCE_PATTERN = /\bCodeBehind\s*=\s*"([^"]+)"|\bCodeFile\s*=\s*"([^"]+)"/gi;
const WEBFORMS_SCRIPT_SRC_PATTERN = /<script[^>]+src\s*=\s*"([^"]+)"/gi;
const DOCUMENT_GET_ELEMENT_BY_ID_PATTERN = /document\.getElementById\s*\(\s*['"]([^'"\s]+)['"]\s*\)/gi;

interface WebFormsContext {
  configFiles: HeuristicArtifact[];
  controlsById: Map<string, HeuristicArtifact[]>;
}

/**
 * Creates a heuristic that detects ASP.NET WebForms references:
 * `appSettings` key lookups, `ConfigurationManager` calls, `.aspx`/`.ascx`
 * `Inherits` directives, and `runat="server"` `src` attributes.
 */
export function createWebFormsHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];
  let context: WebFormsContext = { configFiles: [], controlsById: new Map() };

  return {
    id: "webforms-relations",
    initialize(artifacts) {
      candidates = artifacts;
      context = buildWebFormsContext(artifacts);
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer);
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      if (source.comparablePath.endsWith(".cs")) {
        evaluateConfigReferences(source, emit, context);
        return;
      }

      if (source.comparablePath.endsWith(".aspx")) {
        evaluateAspxReferences(source, emit, candidates);
        return;
      }

      if (source.comparablePath.endsWith(".js")) {
        evaluateClientScriptReferences(source, emit, context);
      }
    },
  };
}

function buildWebFormsContext(artifacts: readonly HeuristicArtifact[]): WebFormsContext {
  const configFiles: HeuristicArtifact[] = [];
  const controlsById = new Map<string, HeuristicArtifact[]>();

  for (const artifact of artifacts) {
    if (!artifact.content) {
      continue;
    }

    if (artifact.basename === "web.config") {
      configFiles.push(artifact);
    }

    if (!artifact.comparablePath.endsWith(".aspx")) {
      continue;
    }

    for (const match of artifact.content.matchAll(WEBFORMS_CONTROL_ID_PATTERN)) {
      const controlId = match[1]?.trim();
      if (!controlId) {
        continue;
      }

      const key = controlId.toLowerCase();
      const bucket = controlsById.get(key) ?? [];
      if (!bucket.includes(artifact)) {
        bucket.push(artifact);
        controlsById.set(key, bucket);
      }
    }
  }

  return { configFiles, controlsById };
}

function evaluateConfigReferences(
  source: HeuristicArtifact,
  emit: Parameters<FallbackHeuristic["evaluate"]>[1],
  context: WebFormsContext
): void {
  CONFIG_APPSETTINGS_PATTERN.lastIndex = 0;
  if (!CONFIG_APPSETTINGS_PATTERN.test(source.content ?? "")) {
    return;
  }

  for (const target of context.configFiles) {
    emit({
      target,
      confidence: 0.65,
      rationale: "webforms config appsettings",
      context: "use",
    });
  }
}

function evaluateAspxReferences(
  source: HeuristicArtifact,
  emit: Parameters<FallbackHeuristic["evaluate"]>[1],
  allCandidates: readonly HeuristicArtifact[]
): void {
  const directiveMatch = WEBFORMS_PAGE_DIRECTIVE_PATTERN.exec(source.content ?? "");
  WEBFORMS_PAGE_DIRECTIVE_PATTERN.lastIndex = 0;

  if (directiveMatch) {
    const directive = directiveMatch[0];
    const seen = new Set<string>();

    for (const match of directive.matchAll(WEBFORMS_CODE_REFERENCE_PATTERN)) {
      const reference = (match[1] ?? match[2])?.trim();
      if (!reference || seen.has(reference)) {
        continue;
      }

      seen.add(reference);
      const target = resolveWebFormsReference(source, reference, allCandidates);
      if (!target) {
        continue;
      }

      emit({
        target,
        confidence: 0.75,
        rationale: `webforms codebehind ${reference}`,
        context: "use",
      });
    }
  }

  const scriptSeen = new Set<string>();

  for (const match of source.content?.matchAll(WEBFORMS_SCRIPT_SRC_PATTERN) ?? []) {
    const reference = match[1]?.trim();
    if (!reference) {
      continue;
    }

    const normalized = reference.split("?")[0];
    if (scriptSeen.has(normalized)) {
      continue;
    }

    scriptSeen.add(normalized);
    const target = resolveWebFormsReference(source, normalized, allCandidates);
    if (!target) {
      continue;
    }

    emit({
      target,
      confidence: 0.6,
      rationale: `webforms script ${normalized}`,
      context: "import",
    });
  }
}

function evaluateClientScriptReferences(
  source: HeuristicArtifact,
  emit: Parameters<FallbackHeuristic["evaluate"]>[1],
  context: WebFormsContext
): void {
  const linked = new Set<string>();

  for (const match of source.content?.matchAll(DOCUMENT_GET_ELEMENT_BY_ID_PATTERN) ?? []) {
    const controlId = match[1]?.trim();
    if (!controlId) {
      continue;
    }

    const targets = context.controlsById.get(controlId.toLowerCase());
    if (!targets) {
      continue;
    }

    for (const target of targets) {
      const targetId = target.artifact.id;
      if (linked.has(targetId)) {
        continue;
      }

      linked.add(targetId);
      emit({
        target,
        confidence: 0.65,
        rationale: `webforms control ${controlId}`,
        context: "use",
      });
    }
  }

  const lowerContent = source.content?.toLowerCase() ?? "";
  if (!lowerContent.includes("document.getelementbyid")) {
    return;
  }

  for (const [controlId, targets] of context.controlsById.entries()) {
    if (
      !lowerContent.includes(`'${controlId}'`) &&
      !lowerContent.includes(`"${controlId}"`)
    ) {
      continue;
    }

    for (const target of targets) {
      const targetId = target.artifact.id;
      if (linked.has(targetId)) {
        continue;
      }

      linked.add(targetId);
      emit({
        target,
        confidence: 0.6,
        rationale: `webforms control ${controlId}`,
        context: "use",
      });
    }
  }
}

function resolveWebFormsReference(
  source: HeuristicArtifact,
  reference: string,
  candidates: readonly HeuristicArtifact[]
): HeuristicArtifact | undefined {
  const trimmed = reference.trim();
  if (!trimmed || isExternalLink(trimmed)) {
    return undefined;
  }

  const withoutFragment = trimmed.split("#")[0];
  const withoutQuery = withoutFragment.split("?")[0];
  let relative = withoutQuery;

  if (relative.startsWith("~/")) {
    relative = relative.slice(2);
  }

  if (relative.startsWith("/")) {
    relative = relative.slice(1);
  }

  const sourceDir = path.dirname(source.comparablePath);
  const candidatePaths = new Set<string>();
  candidatePaths.add(normalizePath(path.join(sourceDir, relative)));
  candidatePaths.add(normalizePath(relative));

  for (const candidate of candidates) {
    if (candidatePaths.has(candidate.comparablePath)) {
      return candidate;
    }
  }

  return undefined;
}
