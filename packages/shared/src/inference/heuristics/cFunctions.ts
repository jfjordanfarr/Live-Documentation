import { isImplementationLayer } from "./artifactLayerUtils";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const C_FUNCTION_DEFINITION_PATTERN = /([A-Za-z_][A-Za-z0-9_\s*]*?)\b([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{}]*\)\s*\{/gm;
const C_FUNCTION_CALL_PATTERN = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
const C_RESERVED_IDENTIFIERS = new Set([
  "if",
  "else",
  "for",
  "while",
  "switch",
  "return",
  "sizeof",
  "do",
  "case",
  "break",
  "continue",
  "goto",
]);

type CFunctionIndex = Map<string, HeuristicArtifact[]>;

export function createCFunctionHeuristic(): FallbackHeuristic {
  let functionIndex: CFunctionIndex = new Map();

  const buildIndex = (artifacts: readonly HeuristicArtifact[]): void => {
    const index: CFunctionIndex = new Map();

    for (const artifact of artifacts) {
      if (!artifact.content || !artifact.comparablePath.endsWith(".c")) {
        continue;
      }

      const stripped = stripCComments(artifact.content);
      const pattern = new RegExp(C_FUNCTION_DEFINITION_PATTERN.source, "gm");

      for (const match of stripped.matchAll(pattern)) {
        const name = match[2];
        if (!name || C_RESERVED_IDENTIFIERS.has(name)) {
          continue;
        }

        const bucket = index.get(name) ?? [];
        bucket.push(artifact);
        index.set(name, bucket);
      }
    }

    functionIndex = index;
  };

  return {
    id: "c-function-call",
    initialize(artifacts) {
      buildIndex(artifacts);
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer) && source.comparablePath.endsWith(".c");
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      const stripped = stripCComments(source.content);
      const bodies = extractFunctionBodies(stripped);
      const recorded = new Set<string>();

      for (const body of bodies) {
        for (const match of body.matchAll(C_FUNCTION_CALL_PATTERN)) {
          const name = match[1];
          if (!name || C_RESERVED_IDENTIFIERS.has(name)) {
            continue;
          }

          const targets = functionIndex.get(name);
          if (!targets) {
            continue;
          }

          for (const target of targets) {
            if (target.artifact.id === source.artifact.id) {
              continue;
            }

            const key = `${target.artifact.id}|${name}`;
            if (recorded.has(key)) {
              continue;
            }

            recorded.add(key);
            emit({
              target,
              confidence: 0.75,
              rationale: `c call ${name}`,
              context: "call",
            });
          }
        }
      }
    },
  };
}

function stripCComments(content: string): string {
  const withoutBlock = content.replace(/\/\*[\s\S]*?\*\//g, " ");
  return withoutBlock.replace(/\/\/.*$/gm, " ");
}

/**
 * Extracts the body of each function definition in the given C source.
 * This ensures we only look for calls inside function bodies, not in
 * function signatures (which would incorrectly match definitions as calls).
 */
function extractFunctionBodies(content: string): string[] {
  const bodies: string[] = [];
  let match: RegExpExecArray | null;
  
  // Reset the regex state
  const pattern = new RegExp(C_FUNCTION_DEFINITION_PATTERN.source, "gm");
  
  while ((match = pattern.exec(content)) !== null) {
    const name = match[2];
    if (C_RESERVED_IDENTIFIERS.has(name)) {
      continue;
    }

    const braceIndex = pattern.lastIndex - 1;
    const body = extractBlock(content, braceIndex);
    if (body) {
      bodies.push(body);
    }
  }

  return bodies;
}

/**
 * Extracts a brace-delimited block starting at the given index.
 * Returns the content between (and including) the braces, or null if unbalanced.
 */
function extractBlock(content: string, braceIndex: number): string | null {
  let depth = 0;
  let index = braceIndex;
  const start = braceIndex;

  while (index < content.length) {
    const char = content[index];
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(start + 1, index);
      }
    }
    index++;
  }

  return null;
}
