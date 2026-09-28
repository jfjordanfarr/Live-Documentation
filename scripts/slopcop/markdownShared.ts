/**
 * A markdown reference-link definition (`[id]: url`) parsed from file content.
 */
export interface ReferenceDefinition {
  /** Byte offset of the definition line in the source content. */
  index: number;
  /** Raw URL target of the reference definition. */
  url: string;
}

/**
 * Parses all reference-link definitions (`[id]: url`) from markdown content.
 *
 * @param content - Raw markdown string.
 * @returns Map from lowercased reference identifier to its definition.
 */
export function extractReferenceDefinitions(content: string): Map<string, ReferenceDefinition> {
  const map = new Map<string, ReferenceDefinition>();
  const lines = content.split(/\r?\n/);
  let offset = 0;

  for (const line of lines) {
    const definitionMatch = line.match(/^\s*\[([^\]]+)\]:\s*(.+)$/);
    if (definitionMatch) {
      const identifier = definitionMatch[1].trim().toLowerCase();
      const rawTarget = definitionMatch[2].trim();
      map.set(identifier, {
        index: offset,
        url: rawTarget
      });
    }

    offset += line.length + 1;
  }

  return map;
}

/**
 * The content with every fenced code block and inline code span replaced by
 * spaces of the same length, so that an offset into the result is an offset
 * into the original. Markdown inside code is literal text: a link or a heading
 * written there is an example, not a link or a heading. The fence rules are
 * CommonMark's, as the symbol audit applies them: a run of three or more
 * backticks or tildes opens a block, and only a run of the same character at
 * least as long closes it.
 */
export function maskCode(content: string): string {
  let inFence = false;
  let fenceChar = "";
  let fenceLength = 0;
  return content
    .split("\n")
    .map((line) => {
      const fence = /^ {0,3}((`{3,})|(~{3,}))([^`~].*)?$/.exec(line);
      if (fence) {
        const run = fence[2] ?? fence[3];
        if (!inFence) {
          inFence = true;
          fenceChar = run[0];
          fenceLength = run.length;
        } else if (run[0] === fenceChar && run.length >= fenceLength) {
          inFence = false;
        }
        return blank(line);
      }
      if (inFence) {
        return blank(line);
      }
      return line.replace(/(`+)[^`\n]*?\1/g, blank);
    })
    .join("\n");
}

function blank(text: string): string {
  return " ".repeat(text.length);
}

/**
 * Computes a sorted array of byte offsets where each line begins.
 *
 * Used with {@link toLineAndColumn} for efficient offset-to-position lookups.
 *
 * @param content - Raw file content.
 * @returns Array of 0-based byte offsets for each line start.
 */
export function computeLineStarts(content: string): number[] {
  const starts = [0];
  for (let index = 0; index < content.length; index += 1) {
    const char = content.charCodeAt(index);
    if (char === 10) {
      starts.push(index + 1);
    }
  }
  return starts;
}

/**
 * Converts a 0-based byte offset to a 1-based line and column number
 * using a precomputed line-start array.
 *
 * @param index - 0-based byte offset.
 * @param lineStarts - Array from {@link computeLineStarts}.
 * @returns 1-based `{ line, column }` position.
 */
export function toLineAndColumn(index: number, lineStarts: number[]): { line: number; column: number } {
  let low = 0;
  let high = lineStarts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const start = lineStarts[mid];
    const nextStart = mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Number.POSITIVE_INFINITY;

    if (index < start) {
      high = mid - 1;
    } else if (index >= nextStart) {
      low = mid + 1;
    } else {
      return {
        line: mid + 1,
        column: index - start + 1
      };
    }
  }

  return { line: 1, column: index + 1 };
}

/**
 * Extracts the URL portion from a raw markdown link target string,
 * stripping angle brackets, titles, and trailing whitespace.
 *
 * Returns `undefined` when the target is empty or whitespace-only.
 */
export function parseLinkTarget(raw: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  let target = raw.trim();

  if (target.startsWith("<") && target.endsWith(">")) {
    target = target.slice(1, -1).trim();
  }

  const spaceIndex = target.indexOf(" ");
  if (spaceIndex !== -1) {
    target = target.slice(0, spaceIndex);
  }

  const quoteIndex = target.indexOf('"');
  if (quoteIndex !== -1) {
    target = target.slice(0, quoteIndex);
  }

  const singleQuoteIndex = target.indexOf("'");
  if (singleQuoteIndex !== -1) {
    target = target.slice(0, singleQuoteIndex);
  }

  target = target.trim();

  if (target.length === 0) {
    return undefined;
  }

  return target;
}
