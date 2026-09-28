import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { computePublicSymbolHeadingInfo, composeSymbolBlocks } from "../core";
import { renderSymbolBlocks } from "../document";
import { pythonAdapter } from "./python";

describe("pythonAdapter docstring bridging", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "python-docstring-"));
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("extracts structured metadata from reStructuredText fields", async () => {
    const filePath = path.join(workspaceRoot, "module.py");
    await fs.writeFile(
      filePath,
      `
def compute(value: int) -> int:
    """Compute value.

    :param value: Input value.
    :type value: int
    :returns: value doubled.
    :rtype: int
    :raises ValueError: when value is negative.
    """
    if value < 0:
        raise ValueError("negative")
    return value * 2
  `.trimStart(),
      "utf8"
    );

    const analysis = await pythonAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();
    expect(analysis?.symbols).toHaveLength(1);

    const symbol = analysis!.symbols[0];
    expect(symbol.documentation?.summary).toBe("Compute value.");
    expect(symbol.documentation?.parameters).toEqual([
      {
        name: "value",
        description: "Input value. (type: int)"
      }
    ]);
    expect(symbol.documentation?.returns).toContain("value doubled.");
    expect(symbol.documentation?.returns).toContain("Type: int");
    expect(symbol.documentation?.exceptions).toEqual([
      {
        type: "ValueError",
        description: "when value is negative."
      }
    ]);

    const docDir = path.join(workspaceRoot, ".live-documentation", "source");
    await fs.mkdir(docDir, { recursive: true });

    const headings = computePublicSymbolHeadingInfo(analysis!.symbols);

    const lines = renderSymbolBlocks(composeSymbolBlocks({ headings, docDir, sourceAbsolute: filePath, sourceRelativePath: path.relative(workspaceRoot, filePath) }));

    expect(lines).toContain("##### `compute` — Parameters");
    expect(lines).toContain("- `value`: Input value. (type: int)");
    expect(lines).toContain("##### `compute` — Returns");
    expect(lines.some((line) => line.includes("ValueError"))).toBe(true);
  });

  it("bridges Google style docstrings including examples", async () => {
    const filePath = path.join(workspaceRoot, "google_style.py");
    await fs.writeFile(
      filePath,
      `
def summarize(items: list[int], limit: int | None = None) -> str:
    """Summarize a sequence into a string.

    Args:
        items: Sequence to summarize.
        limit: Optional soft limit for the number of items.

    Returns:
        str: Joined summary string.

    Raises:
        ValueError: When limit is negative.

    Examples:
        >>> summarize([1, 2, 3])
        '1,2,3'
    """
    if limit is not None and limit < 0:
        raise ValueError("limit")
    result = items if limit is None else items[:limit]
    return ",".join(str(item) for item in result)
  `.trimStart(),
      "utf8"
    );

    const analysis = await pythonAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();
    const symbol = analysis!.symbols[0];

    expect(symbol.documentation?.parameters).toEqual([
      {
        name: "items",
        description: "Sequence to summarize."
      },
      {
        name: "limit",
        description: "Optional soft limit for the number of items."
      }
    ]);
    expect(symbol.documentation?.returns).toContain("Joined summary string.");
    expect(symbol.documentation?.exceptions?.[0]).toEqual({
      type: "ValueError",
      description: "When limit is negative."
    });
    expect(symbol.documentation?.examples?.[0]?.code).toContain(">>> summarize([1, 2, 3])");
    expect(symbol.documentation?.examples?.[0]?.language).toBe("python");
  });

  it("parses NumPy style sections with types", async () => {
    const filePath = path.join(workspaceRoot, "numpy_style.py");
    await fs.writeFile(
      filePath,
      `
def scale(values, factor):
    """Scale values by a factor.

    Parameters
    ----------
    values : Sequence[float]
        Values to scale.
    factor : float
        Scaling factor.

    Returns
    -------
    list[float]
        Scaled values.

    Raises
    ------
    ValueError
        When factor is zero.
    """
    if factor == 0:
        raise ValueError("factor")
    return [item * factor for item in values]
  `.trimStart(),
      "utf8"
    );

    const analysis = await pythonAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();
    const symbol = analysis!.symbols[0];

    expect(symbol.documentation?.parameters).toEqual([
      {
        name: "values",
        description: "Values to scale. (type: Sequence[float])"
      },
      {
        name: "factor",
        description: "Scaling factor. (type: float)"
      }
    ]);
    expect(symbol.documentation?.returns).toContain("Scaled values.");
    expect(symbol.documentation?.returns).toContain("Type: list[float]");
    expect(symbol.documentation?.exceptions?.[0]).toEqual({
      type: "ValueError",
      description: "When factor is zero."
    });
  });
});
