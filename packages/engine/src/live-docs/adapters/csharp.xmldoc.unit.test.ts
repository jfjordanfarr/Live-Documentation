/**
 * Unit tests for C# XML documentation parsing module.
 *
 * Tests cover the XML doc comment parsing logic for C# triple-slash comments,
 * including all standard tags like <summary>, <param>, <returns>, <exception>,
 * <example>, <see>, etc.
 */

import { describe, expect, it } from "vitest";

import {
  buildDocumentationFromLines,
  stripDocCommentMarker,
  extractSingleTagText,
  extractParameterTags,
  extractExceptionTags,
  extractExampleTags,
  extractLinkTags,
  extractRawDocFragments,
  detectUnsupportedTags,
  parseXmlAttributes,
  normalizeXmlText,
  decodeXmlEntities,
  normalizeCrefTarget,
  renderCrefText,
  hasStructuredContent,
  RECOGNIZED_DOC_TAGS
} from "./csharp.xmldoc";

describe("csharp.xmldoc unit tests", () => {
  describe("buildDocumentationFromLines", () => {
    it("parses simple summary", () => {
      const lines = [
        "/// <summary>",
        "/// A simple method.",
        "/// </summary>"
      ];
      const result = buildDocumentationFromLines(lines);
      expect(result?.source).toBe("csharp-xml");
      expect(result?.summary).toBe("A simple method.");
    });

    it("parses summary with remarks", () => {
      const lines = [
        "/// <summary>A method.</summary>",
        "/// <remarks>More details here.</remarks>"
      ];
      const result = buildDocumentationFromLines(lines);
      expect(result?.summary).toBe("A method.");
      expect(result?.remarks).toBe("More details here.");
    });

    it("returns undefined for empty input", () => {
      expect(buildDocumentationFromLines([])).toBeUndefined();
    });

    it("returns undefined for whitespace-only content", () => {
      const lines = ["///   ", "///"];
      expect(buildDocumentationFromLines(lines)).toBeUndefined();
    });

    it("parses all tag types together", () => {
      const lines = [
        "/// <summary>Main summary.</summary>",
        "/// <param name=\"x\">First param.</param>",
        "/// <returns>The result.</returns>",
        "/// <exception cref=\"ArgumentNullException\">When null.</exception>"
      ];
      const result = buildDocumentationFromLines(lines);
      expect(result?.summary).toBe("Main summary.");
      expect(result?.parameters).toHaveLength(1);
      expect(result?.returns).toBe("The result.");
      expect(result?.exceptions).toHaveLength(1);
    });
  });

  describe("stripDocCommentMarker", () => {
    it("strips /// prefix", () => {
      expect(stripDocCommentMarker("/// Hello")).toBe("Hello");
    });

    it("strips /// with leading whitespace", () => {
      expect(stripDocCommentMarker("    /// Hello")).toBe("Hello");
    });

    it("preserves content after stripping", () => {
      expect(stripDocCommentMarker("/// <summary>Test</summary>")).toBe("<summary>Test</summary>");
    });

    it("handles empty lines", () => {
      expect(stripDocCommentMarker("///")).toBe("");
    });
  });

  describe("extractSingleTagText", () => {
    it("extracts summary content", () => {
      const block = "<summary>Hello world.</summary>";
      expect(extractSingleTagText(block, "summary")).toBe("Hello world.");
    });

    it("handles multi-line content", () => {
      const block = "<summary>\nLine 1\nLine 2\n</summary>";
      expect(extractSingleTagText(block, "summary")).toBe("Line 1\nLine 2");
    });

    it("returns undefined for missing tag", () => {
      expect(extractSingleTagText("<remarks>x</remarks>", "summary")).toBeUndefined();
    });

    it("handles tags with attributes", () => {
      const block = '<summary xml:space="preserve">Content</summary>';
      expect(extractSingleTagText(block, "summary")).toBe("Content");
    });
  });

  describe("extractParameterTags", () => {
    it("extracts single parameter", () => {
      const block = '<param name="x">The X value.</param>';
      const params = extractParameterTags(block, "param");
      expect(params).toHaveLength(1);
      expect(params[0]).toEqual({
        name: "x",
        description: "The X value."
      });
    });

    it("extracts multiple parameters", () => {
      const block = `
        <param name="a">First</param>
        <param name="b">Second</param>
        <param name="c">Third</param>
      `;
      const params = extractParameterTags(block, "param");
      expect(params).toHaveLength(3);
      expect(params.map(p => p.name)).toEqual(["a", "b", "c"]);
    });

    it("extracts typeparam tags", () => {
      const block = '<typeparam name="T">The type.</typeparam>';
      const typeParams = extractParameterTags(block, "typeparam");
      expect(typeParams).toHaveLength(1);
      expect(typeParams[0]?.name).toBe("T");
    });

    it("handles empty description", () => {
      const block = '<param name="x"></param>';
      const params = extractParameterTags(block, "param");
      expect(params[0]?.description).toBeUndefined();
    });
  });

  describe("extractExceptionTags", () => {
    it("extracts exception with cref and description", () => {
      const block = '<exception cref="ArgumentNullException">When null.</exception>';
      const exceptions = extractExceptionTags(block);
      expect(exceptions).toHaveLength(1);
      expect(exceptions[0]).toEqual({
        type: "ArgumentNullException",
        description: "When null."
      });
    });

    it("sorts exceptions by type", () => {
      const block = `
        <exception cref="ZException">Z</exception>
        <exception cref="AException">A</exception>
      `;
      const exceptions = extractExceptionTags(block);
      expect(exceptions[0]?.type).toBe("AException");
      expect(exceptions[1]?.type).toBe("ZException");
    });

    it("handles empty description", () => {
      const block = '<exception cref="Error"></exception>';
      const exceptions = extractExceptionTags(block);
      expect(exceptions[0]?.description).toBeUndefined();
    });
  });

  describe("extractExampleTags", () => {
    it("extracts example with code block", () => {
      const block = `
        <example>
          Usage example:
          <code>
            var x = 1;
          </code>
        </example>
      `;
      const examples = extractExampleTags(block);
      expect(examples).toHaveLength(1);
      expect(examples[0]?.description).toContain("Usage example");
      expect(examples[0]?.code).toContain("var x = 1;");
    });

    it("extracts code language attribute", () => {
      const block = '<example><code lang="csharp">code</code></example>';
      const examples = extractExampleTags(block);
      expect(examples[0]?.language).toBe("csharp");
    });

    it("handles example without code", () => {
      const block = "<example>Just a description.</example>";
      const examples = extractExampleTags(block);
      expect(examples[0]?.description).toBe("Just a description.");
      expect(examples[0]?.code).toBeUndefined();
    });
  });

  describe("extractLinkTags", () => {
    it("extracts see cref links", () => {
      const block = '<see cref="MyClass"/>';
      const links = extractLinkTags(block);
      expect(links).toHaveLength(1);
      expect(links[0]).toEqual({
        kind: "cref",
        target: "MyClass",
        text: undefined
      });
    });

    it("extracts see href links", () => {
      const block = '<see href="https://example.com"/>';
      const links = extractLinkTags(block);
      expect(links).toHaveLength(1);
      expect(links[0]?.kind).toBe("href");
      expect(links[0]?.target).toBe("https://example.com");
    });

    it("extracts seealso tags", () => {
      const block = '<seealso cref="OtherClass"/>';
      const links = extractLinkTags(block);
      expect(links).toHaveLength(1);
      expect(links[0]?.target).toBe("OtherClass");
    });

    it("deduplicates identical links", () => {
      const block = '<see cref="Foo"/><see cref="Foo"/>';
      const links = extractLinkTags(block);
      expect(links).toHaveLength(1);
    });

    it("extracts link text", () => {
      const block = '<see cref="MyClass">Custom text</see>';
      const links = extractLinkTags(block);
      expect(links[0]?.text).toBe("Custom text");
    });
  });

  describe("extractRawDocFragments", () => {
    it("extracts inheritdoc tags", () => {
      const block = '<inheritdoc/>';
      const fragments = extractRawDocFragments(block);
      expect(fragments).toContain("<inheritdoc/>");
    });

    it("extracts inheritdoc with cref", () => {
      const block = '<inheritdoc cref="BaseClass"/>';
      const fragments = extractRawDocFragments(block);
      expect(fragments).toHaveLength(1);
      expect(fragments[0]).toContain("cref=");
    });

    it("extracts include tags", () => {
      const block = '<include file="docs.xml" path="/doc/summary"/>';
      const fragments = extractRawDocFragments(block);
      expect(fragments).toHaveLength(1);
    });
  });

  describe("detectUnsupportedTags", () => {
    it("returns empty for standard tags", () => {
      const block = "<summary><param><returns><see>";
      expect(detectUnsupportedTags(block)).toHaveLength(0);
    });

    it("detects unknown tags", () => {
      const block = "<custom>content</custom>";
      const unsupported = detectUnsupportedTags(block);
      expect(unsupported).toContain("custom");
    });

    it("ignores XML comments", () => {
      const block = "<!-- comment --><summary>text</summary>";
      expect(detectUnsupportedTags(block)).toHaveLength(0);
    });
  });

  describe("parseXmlAttributes", () => {
    it("parses single attribute", () => {
      expect(parseXmlAttributes('name="value"')).toEqual({ name: "value" });
    });

    it("parses multiple attributes", () => {
      const attrs = parseXmlAttributes('name="x" cref="MyClass"');
      expect(attrs).toEqual({ name: "x", cref: "MyClass" });
    });

    it("decodes entities in values", () => {
      expect(parseXmlAttributes('value="a &amp; b"')).toEqual({ value: "a & b" });
    });

    it("handles empty string", () => {
      expect(parseXmlAttributes("")).toEqual({});
    });
  });

  describe("normalizeXmlText", () => {
    it("handles para tags", () => {
      expect(normalizeXmlText("<para>First</para><para>Second</para>")).toBe("First\n\nSecond");
    });

    it("handles br tags", () => {
      expect(normalizeXmlText("Line1<br/>Line2")).toBe("Line1\nLine2");
    });

    it("handles list tags", () => {
      const text = normalizeXmlText('<list type="bullet"><item>A</item><item>B</item></list>');
      expect(text).toContain("- A");
      expect(text).toContain("- B");
    });

    it("handles see cref inline", () => {
      expect(normalizeXmlText('<see cref="MyClass"/>')).toBe("`MyClass`");
    });

    it("handles paramref inline", () => {
      expect(normalizeXmlText('<paramref name="x"/>')).toBe("`x`");
    });

    it("handles langword inline", () => {
      expect(normalizeXmlText('<see langword="null"/>')).toBe("`null`");
    });

    it("handles inline code", () => {
      expect(normalizeXmlText("<c>code</c>")).toBe("`code`");
    });

    it("handles code blocks", () => {
      const result = normalizeXmlText("<code>var x = 1;</code>");
      expect(result).toContain("```");
      expect(result).toContain("var x = 1;");
    });

    it("strips remaining tags", () => {
      expect(normalizeXmlText("<unknown>text</unknown>")).toBe("text");
    });

    it("collapses multiple newlines", () => {
      expect(normalizeXmlText("a\n\n\n\nb")).toBe("a\n\nb");
    });
  });

  describe("decodeXmlEntities", () => {
    it("decodes &lt;", () => {
      expect(decodeXmlEntities("&lt;")).toBe("<");
    });

    it("decodes &gt;", () => {
      expect(decodeXmlEntities("&gt;")).toBe(">");
    });

    it("decodes &amp;", () => {
      expect(decodeXmlEntities("&amp;")).toBe("&");
    });

    it("decodes &quot;", () => {
      expect(decodeXmlEntities("&quot;")).toBe('"');
    });

    it("decodes &apos;", () => {
      expect(decodeXmlEntities("&apos;")).toBe("'");
    });

    it("decodes multiple entities", () => {
      expect(decodeXmlEntities("&lt;tag&gt;")).toBe("<tag>");
    });
  });

  describe("normalizeCrefTarget", () => {
    it("strips type prefix", () => {
      expect(normalizeCrefTarget("T:MyNamespace.MyClass")).toBe("MyNamespace.MyClass");
    });

    it("strips method prefix", () => {
      expect(normalizeCrefTarget("M:MyClass.MyMethod")).toBe("MyClass.MyMethod");
    });

    it("converts #ctor to .ctor", () => {
      expect(normalizeCrefTarget("MyClass.#ctor")).toBe("MyClass..ctor");
    });

    it("converts curly braces to angle brackets", () => {
      expect(normalizeCrefTarget("List{T}")).toBe("List<T>");
    });

    it("handles empty input", () => {
      expect(normalizeCrefTarget("")).toBe("");
    });
  });

  describe("renderCrefText", () => {
    it("uses backticks by default", () => {
      expect(renderCrefText("MyClass")).toBe("`MyClass`");
    });

    it("uses custom text when provided", () => {
      expect(renderCrefText("MyClass", "custom")).toBe("custom");
    });

    it("ignores custom text if same as target", () => {
      expect(renderCrefText("MyClass", "MyClass")).toBe("`MyClass`");
    });

    it("normalizes target before rendering", () => {
      expect(renderCrefText("T:MyClass")).toBe("`MyClass`");
    });
  });

  describe("hasStructuredContent", () => {
    it("returns false for empty doc", () => {
      expect(hasStructuredContent({ source: "csharp-xml" })).toBe(false);
    });

    it("returns true for summary", () => {
      expect(hasStructuredContent({ source: "csharp-xml", summary: "text" })).toBe(true);
    });

    it("returns true for parameters", () => {
      expect(hasStructuredContent({ source: "csharp-xml", parameters: [{ name: "x" }] })).toBe(true);
    });

    it("returns true for exceptions", () => {
      expect(hasStructuredContent({ source: "csharp-xml", exceptions: [{ type: "Error" }] })).toBe(true);
    });
  });

  describe("RECOGNIZED_DOC_TAGS", () => {
    it("includes common tags", () => {
      expect(RECOGNIZED_DOC_TAGS.has("summary")).toBe(true);
      expect(RECOGNIZED_DOC_TAGS.has("param")).toBe(true);
      expect(RECOGNIZED_DOC_TAGS.has("returns")).toBe(true);
      expect(RECOGNIZED_DOC_TAGS.has("exception")).toBe(true);
      expect(RECOGNIZED_DOC_TAGS.has("see")).toBe(true);
    });

    it("includes inheritdoc", () => {
      expect(RECOGNIZED_DOC_TAGS.has("inheritdoc")).toBe(true);
    });
  });
});
