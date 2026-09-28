/**
 * Unit tests for Python docstring parsing module.
 *
 * Tests cover the three major docstring formats:
 * - reStructuredText (`:param:`, `:returns:`, etc.)
 * - Google style (`Args:`, `Returns:`, etc.)
 * - NumPy style (underlined section headers)
 *
 * These tests exercise the parsing functions directly, without involving
 * the adapter layer or file I/O.
 */

import { describe, expect, it } from "vitest";

import {
  parseDocstring,
  extractDocstringSummary,
  detectGoogleSections,
  detectNumpySections,
  parseIndentedEntries,
  parseNumpyEntries,
  normalizeExample,
  joinParagraphs,
  detectMinimumIndent,
  capitalize,
  createEmptyDocstringState
} from "./python.docstring";

describe("python.docstring unit tests", () => {
  describe("parseDocstring", () => {
    it("parses a simple one-line docstring", () => {
      const result = parseDocstring("A simple function.");
      expect(result.summary).toBe("A simple function.");
      expect(result.source).toBe("docstring");
    });

    it("parses a multi-line summary", () => {
      const result = parseDocstring("This is a longer\ndocstring summary.");
      expect(result.summary).toBe("This is a longer docstring summary.");
    });

    it("extracts summary ending at period", () => {
      const result = parseDocstring("Short summary.\n\nMore details here.");
      expect(result.summary).toBe("Short summary.");
      expect(result.remarks).toContain("More details here.");
    });

    it("handles empty docstring gracefully", () => {
      const result = parseDocstring("");
      expect(result.source).toBe("docstring");
      expect(result.summary).toBeUndefined();
    });
  });

  describe("reStructuredText format", () => {
    it("parses :param: fields", () => {
      const docstring = `Do something with x.

:param x: The input value
:param y: Another value`;

      const result = parseDocstring(docstring);
      expect(result.parameters).toHaveLength(2);
      expect(result.parameters?.[0]).toEqual({
        name: "x",
        description: "The input value"
      });
      expect(result.parameters?.[1]).toEqual({
        name: "y",
        description: "Another value"
      });
    });

    it("parses :type: annotations alongside :param:", () => {
      const docstring = `Function with typed params.

:param x: The input
:type x: int
:param y: The output
:type y: str`;

      const result = parseDocstring(docstring);
      expect(result.parameters).toHaveLength(2);
      expect(result.parameters?.[0]?.description).toContain("type: int");
      expect(result.parameters?.[1]?.description).toContain("type: str");
    });

    it("parses :returns: and :rtype:", () => {
      const docstring = `Returns a value.

:returns: The computed result
:rtype: int`;

      const result = parseDocstring(docstring);
      expect(result.returns).toContain("The computed result");
      expect(result.returns).toContain("Type: int");
    });

    it("parses :raises: with multiple exception types", () => {
      const docstring = `May raise errors.

:raises ValueError: When value is bad
:raises TypeError|KeyError: When type or key is wrong`;

      const result = parseDocstring(docstring);
      expect(result.exceptions).toHaveLength(3);
      const types = result.exceptions?.map(e => e.type);
      expect(types).toContain("ValueError");
      expect(types).toContain("TypeError");
      expect(types).toContain("KeyError");
    });

    it("parses :seealso: as links", () => {
      const docstring = `See related functions.

:seealso: other_function
:see: https://example.com/docs`;

      const result = parseDocstring(docstring);
      expect(result.links).toHaveLength(2);
      expect(result.links?.[0]).toEqual({
        kind: "unknown",
        target: "other_function"
      });
      expect(result.links?.[1]).toEqual({
        kind: "href",
        target: "https://example.com/docs"
      });
    });

    it("parses :deprecated: as remarks", () => {
      const docstring = `Old function.

:deprecated: Use new_function instead`;

      const result = parseDocstring(docstring);
      expect(result.remarks).toContain("Deprecated: Use new_function instead");
    });

    it("handles multi-line field content", () => {
      const docstring = `Function with long param docs.

:param config: A configuration object
    that spans multiple lines
    with detailed explanation`;

      const result = parseDocstring(docstring);
      expect(result.parameters?.[0]?.description).toContain("that spans multiple lines");
      expect(result.parameters?.[0]?.description).toContain("with detailed explanation");
    });

    it("parses :yield: for generators", () => {
      const docstring = `Generate values.

:yields: Sequential integers`;

      const result = parseDocstring(docstring);
      expect(result.value).toContain("Sequential integers");
    });
  });

  describe("Google style format", () => {
    it("parses Args section", () => {
      const docstring = `Process some data.

Args:
    x (int): The first argument
    y (str): The second argument`;

      const result = parseDocstring(docstring);
      expect(result.parameters).toHaveLength(2);
      expect(result.parameters?.[0]).toEqual({
        name: "x",
        description: "The first argument (type: int)"
      });
    });

    it("parses Returns section", () => {
      const docstring = `Compute a result.

Returns:
    int: The computed value`;

      const result = parseDocstring(docstring);
      expect(result.returns).toBeDefined();
      expect(result.returns).toContain("The computed value");
    });

    it("parses Raises section", () => {
      const docstring = `May fail.

Raises:
    ValueError: When input is invalid
    RuntimeError: When something goes wrong`;

      const result = parseDocstring(docstring);
      expect(result.exceptions).toHaveLength(2);
      expect(result.exceptions?.[0]?.type).toBe("ValueError");
      expect(result.exceptions?.[1]?.type).toBe("RuntimeError");
    });

    it("parses Examples section with >>> prompts", () => {
      const docstring = `Show usage.

Examples:
    >>> add(1, 2)
    3
    >>> add(0, 0)
    0`;

      const result = parseDocstring(docstring);
      expect(result.examples).toHaveLength(1);
      expect(result.examples?.[0]?.code).toContain(">>> add(1, 2)");
      expect(result.examples?.[0]?.language).toBe("python");
    });

    it("parses Notes section as remarks", () => {
      const docstring = `Important function.

Notes:
    This function has special behavior
    when called with negative numbers.`;

      const result = parseDocstring(docstring);
      expect(result.remarks).toContain("Notes:");
      expect(result.remarks).toContain("special behavior");
    });

    it("parses Yields section for generators", () => {
      const docstring = `Generate values.

Yields:
    int: Sequential integers`;

      const result = parseDocstring(docstring);
      expect(result.value).toContain("Sequential integers");
    });

    it("parses Keyword Args section", () => {
      const docstring = `Process data.

Keyword Args:
    verbose (bool): Enable verbose output`;

      const result = parseDocstring(docstring);
      expect(result.parameters).toHaveLength(1);
      expect(result.parameters?.[0]?.name).toBe("verbose");
    });
  });

  describe("NumPy style format", () => {
    it("parses Parameters section with underline", () => {
      const docstring = `Process data.

Parameters
----------
x : int
    The first value
y : str
    The second value`;

      const result = parseDocstring(docstring);
      expect(result.parameters).toHaveLength(2);
      expect(result.parameters?.[0]?.name).toBe("x");
      expect(result.parameters?.[0]?.description).toContain("The first value");
    });

    it("parses Returns section with underline", () => {
      const docstring = `Compute result.

Returns
-------
int
    The computed value`;

      const result = parseDocstring(docstring);
      expect(result.returns).toBeDefined();
      expect(result.returns).toContain("The computed value");
    });

    it("parses Raises section with underline", () => {
      const docstring = `May fail.

Raises
------
ValueError
    When input is invalid`;

      const result = parseDocstring(docstring);
      expect(result.exceptions).toHaveLength(1);
      expect(result.exceptions?.[0]?.type).toBe("ValueError");
    });

    it("parses Examples section with underline", () => {
      const docstring = `Show usage.

Examples
--------
>>> multiply(2, 3)
6`;

      const result = parseDocstring(docstring);
      expect(result.examples).toHaveLength(1);
      expect(result.examples?.[0]?.code).toContain(">>> multiply(2, 3)");
    });

    it("handles various underline characters", () => {
      const docstring = `Function docs.

Parameters
==========
x : int
    Value

Returns
~~~~~~~
int
    Result`;

      const result = parseDocstring(docstring);
      expect(result.parameters).toHaveLength(1);
      expect(result.returns).toBeDefined();
    });

    it("parses See Also section", () => {
      const docstring = `Do something.

See Also
--------
other_func : Related function`;

      const result = parseDocstring(docstring);
      expect(result.remarks).toContain("See Also:");
    });
  });

  describe("extractDocstringSummary", () => {
    it("extracts single-line summary", () => {
      const { summary, remainder } = extractDocstringSummary(["A function."]);
      expect(summary).toBe("A function.");
      expect(remainder).toHaveLength(0);
    });

    it("joins multi-line summary until period", () => {
      const { summary, remainder } = extractDocstringSummary([
        "This is a",
        "multi-line summary.",
        "",
        "More content."
      ]);
      expect(summary).toBe("This is a multi-line summary.");
      expect(remainder).toContain("More content.");
    });

    it("stops at blank line if no period", () => {
      const { summary, remainder } = extractDocstringSummary([
        "Short summary",
        "",
        "Details follow"
      ]);
      expect(summary).toBe("Short summary");
      expect(remainder).toContain("Details follow");
    });

    it("skips leading blank lines", () => {
      const { summary } = extractDocstringSummary(["", "", "Actual summary."]);
      expect(summary).toBe("Actual summary.");
    });

    it("handles empty input", () => {
      const { summary, remainder } = extractDocstringSummary([]);
      expect(summary).toBeUndefined();
      expect(remainder).toHaveLength(0);
    });
  });

  describe("detectGoogleSections", () => {
    it("returns true for lines with section headers", () => {
      expect(detectGoogleSections(["Args:", "    x: value"])).toBe(true);
      expect(detectGoogleSections(["Returns:", "    int"])).toBe(true);
      expect(detectGoogleSections(["Raises:", "    ValueError"])).toBe(true);
    });

    it("returns false for non-section content", () => {
      expect(detectGoogleSections(["Just some text", "No sections here"])).toBe(false);
      expect(detectGoogleSections(["x: int", "y: str"])).toBe(false);
    });

    it("handles empty input", () => {
      expect(detectGoogleSections([])).toBe(false);
    });
  });

  describe("detectNumpySections", () => {
    it("returns true for underlined headers", () => {
      expect(detectNumpySections(["Parameters", "----------"])).toBe(true);
      expect(detectNumpySections(["Returns", "======="])).toBe(true);
      expect(detectNumpySections(["Notes", "~~~~~"])).toBe(true);
    });

    it("returns false without underlines", () => {
      expect(detectNumpySections(["Parameters", "x : int"])).toBe(false);
    });

    it("requires underline to be at least 3 characters", () => {
      expect(detectNumpySections(["Parameters", "--"])).toBe(false);
      expect(detectNumpySections(["Parameters", "---"])).toBe(true);
    });

    it("handles empty input", () => {
      expect(detectNumpySections([])).toBe(false);
    });
  });

  describe("parseIndentedEntries", () => {
    it("parses entries with name, type, and description", () => {
      const lines = [
        "    x (int): The first value",
        "    y (str): The second value"
      ];
      const entries = parseIndentedEntries(lines);
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual({
        name: "x",
        type: "int",
        description: "The first value"
      });
    });

    it("handles multi-line descriptions", () => {
      const lines = [
        "    config (dict): Configuration object",
        "        with multiple lines",
        "        of description"
      ];
      const entries = parseIndentedEntries(lines);
      expect(entries).toHaveLength(1);
      expect(entries[0]?.description).toContain("with multiple lines");
    });

    it("handles entries without type", () => {
      const lines = ["    x: Just a value"];
      const entries = parseIndentedEntries(lines);
      expect(entries[0]?.name).toBe("x");
      expect(entries[0]?.type).toBeUndefined();
    });

    it("handles empty input", () => {
      expect(parseIndentedEntries([])).toHaveLength(0);
    });

    it("handles **kwargs style names", () => {
      const lines = ["    **kwargs (dict): Keyword arguments"];
      const entries = parseIndentedEntries(lines);
      expect(entries[0]?.name).toBe("**kwargs");
    });
  });

  describe("parseNumpyEntries", () => {
    it("parses entries with name and type on one line", () => {
      const lines = [
        "x : int",
        "    The first value",
        "y : str",
        "    The second value"
      ];
      const entries = parseNumpyEntries(lines);
      expect(entries).toHaveLength(2);
      expect(entries[0]).toEqual({
        name: "x",
        type: "int",
        description: "The first value"
      });
    });

    it("handles entries with multi-line descriptions", () => {
      const lines = [
        "config : dict",
        "    A configuration object",
        "    with detailed docs"
      ];
      const entries = parseNumpyEntries(lines);
      expect(entries[0]?.description).toContain("with detailed docs");
    });

    it("handles entries without type", () => {
      const lines = [
        "x",
        "    Just a value"
      ];
      const entries = parseNumpyEntries(lines);
      expect(entries[0]?.name).toBe("x");
      expect(entries[0]?.type).toBeUndefined();
    });
  });

  describe("normalizeExample", () => {
    it("extracts interactive Python examples", () => {
      const block = `>>> print("hello")
hello
>>> 1 + 1
2`;
      const example = normalizeExample(block);
      expect(example?.code).toContain('>>> print("hello")');
      expect(example?.language).toBe("python");
    });

    it("separates description from code", () => {
      const block = `This shows how to add numbers.
>>> add(1, 2)
3`;
      const example = normalizeExample(block);
      expect(example?.description).toContain("how to add numbers");
      expect(example?.code).toContain(">>> add(1, 2)");
    });

    it("returns undefined for empty blocks", () => {
      expect(normalizeExample("")).toBeUndefined();
      expect(normalizeExample("   ")).toBeUndefined();
    });

    it("handles example without code", () => {
      const block = "This is just a description.";
      const example = normalizeExample(block);
      expect(example?.description).toBe("This is just a description.");
      expect(example?.code).toBeUndefined();
      expect(example?.language).toBeUndefined();
    });
  });

  describe("utility functions", () => {
    describe("joinParagraphs", () => {
      it("joins non-empty chunks with double newlines", () => {
        const result = joinParagraphs(["First", "Second", "Third"]);
        expect(result).toBe("First\n\nSecond\n\nThird");
      });

      it("filters out empty chunks", () => {
        const result = joinParagraphs(["First", "", "  ", "Second"]);
        expect(result).toBe("First\n\nSecond");
      });

      it("trims trailing whitespace from chunks", () => {
        const result = joinParagraphs(["First   ", "Second  \n"]);
        expect(result).toBe("First\n\nSecond");
      });

      it("handles empty input", () => {
        expect(joinParagraphs([])).toBe("");
      });
    });

    describe("detectMinimumIndent", () => {
      it("finds minimum indentation", () => {
        const lines = [
          "    four spaces",
          "  two spaces",
          "      six spaces"
        ];
        expect(detectMinimumIndent(lines)).toBe(2);
      });

      it("ignores empty lines", () => {
        const lines = ["", "    indented", ""];
        expect(detectMinimumIndent(lines)).toBe(4);
      });

      it("returns 0 for no indentation", () => {
        const lines = ["no indent", "also no indent"];
        expect(detectMinimumIndent(lines)).toBe(0);
      });

      it("handles empty input", () => {
        expect(detectMinimumIndent([])).toBe(0);
      });
    });

    describe("capitalize", () => {
      it("capitalizes first character", () => {
        expect(capitalize("hello")).toBe("Hello");
        expect(capitalize("HELLO")).toBe("HELLO");
        expect(capitalize("hELLO")).toBe("HELLO");
      });

      it("handles empty strings", () => {
        expect(capitalize("")).toBe("");
      });

      it("handles single character", () => {
        expect(capitalize("a")).toBe("A");
      });
    });

    describe("createEmptyDocstringState", () => {
      it("creates state with empty collections", () => {
        const state = createEmptyDocstringState();
        expect(state.remarks).toEqual([]);
        expect(state.parameters.size).toBe(0);
        expect(state.exceptions.size).toBe(0);
        expect(state.returnLines).toEqual([]);
        expect(state.returnType).toEqual([]);
        expect(state.yieldLines).toEqual([]);
        expect(state.links).toEqual([]);
        expect(state.examples).toEqual([]);
        expect(state.raw).toEqual([]);
      });
    });
  });

  describe("edge cases", () => {
    it("handles mixed format docstrings gracefully", () => {
      const docstring = `Mixed format docstring.

:param x: reST style param

Args:
    y (int): Google style param`;

      const result = parseDocstring(docstring);
      // Should parse at least some parameters
      expect(result.parameters?.length).toBeGreaterThan(0);
    });

    it("handles docstring with only whitespace sections", () => {
      const result = parseDocstring("   \n\n   ");
      expect(result.summary).toBeUndefined();
    });

    it("handles docstring with CRLF line endings", () => {
      const docstring = "Summary.\r\n\r\n:param x: Value";
      const result = parseDocstring(docstring);
      expect(result.summary).toBe("Summary.");
      expect(result.parameters).toHaveLength(1);
    });

    it("handles very long docstrings", () => {
      const longDescription = "x".repeat(1000);
      const docstring = `Summary.\n\n:param value: ${longDescription}`;
      const result = parseDocstring(docstring);
      expect(result.parameters?.[0]?.description).toContain(longDescription);
    });
  });
});
