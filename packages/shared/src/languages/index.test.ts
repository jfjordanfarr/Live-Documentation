/**
 * Tests for Language Syntax utilities
 */

import { describe, it, expect } from "vitest";
import {
  getSyntaxById,
  getSyntaxByExtension,
  getSyntaxByPath,
  isLanguageSupported,
  isExtensionSupported,
  goSyntax,
  cSyntax,
  csharpSyntax,
  typescriptSyntax,
  pythonSyntax,
} from "./index";

describe("Language Syntax Registry", () => {
  describe("getSyntaxById", () => {
    it("returns syntax for known language IDs", () => {
      expect(getSyntaxById("go")).toBe(goSyntax);
      expect(getSyntaxById("c")).toBe(cSyntax);
      expect(getSyntaxById("csharp")).toBe(csharpSyntax);
      expect(getSyntaxById("typescript")).toBe(typescriptSyntax);
      expect(getSyntaxById("python")).toBe(pythonSyntax);
    });

    it("is case-insensitive", () => {
      expect(getSyntaxById("Go")).toBe(goSyntax);
      expect(getSyntaxById("GO")).toBe(goSyntax);
      expect(getSyntaxById("CSharp")).toBe(csharpSyntax);
    });

    it("returns undefined for unknown languages", () => {
      expect(getSyntaxById("unknown")).toBeUndefined();
      expect(getSyntaxById("brainfuck")).toBeUndefined();
    });
  });

  describe("getSyntaxByExtension", () => {
    it("returns syntax for known extensions", () => {
      expect(getSyntaxByExtension(".go")).toBe(goSyntax);
      expect(getSyntaxByExtension(".c")).toBe(cSyntax);
      expect(getSyntaxByExtension(".h")).toBe(cSyntax);
      expect(getSyntaxByExtension(".cs")).toBe(csharpSyntax);
      expect(getSyntaxByExtension(".ts")).toBe(typescriptSyntax);
      expect(getSyntaxByExtension(".py")).toBe(pythonSyntax);
    });

    it("is case-insensitive", () => {
      expect(getSyntaxByExtension(".GO")).toBe(goSyntax);
      expect(getSyntaxByExtension(".Cs")).toBe(csharpSyntax);
    });

    it("returns undefined for unknown extensions", () => {
      expect(getSyntaxByExtension(".unknown")).toBeUndefined();
      expect(getSyntaxByExtension(".bf")).toBeUndefined();
    });
  });

  describe("getSyntaxByPath", () => {
    it("extracts extension and returns syntax", () => {
      expect(getSyntaxByPath("main.go")).toBe(goSyntax);
      expect(getSyntaxByPath("/path/to/file.cs")).toBe(csharpSyntax);
      expect(getSyntaxByPath("C:\\projects\\app.ts")).toBe(typescriptSyntax);
    });

    it("returns undefined for files without matching extensions", () => {
      expect(getSyntaxByPath("Makefile")).toBeUndefined();
      expect(getSyntaxByPath("file.unknown")).toBeUndefined();
    });
  });

  describe("isLanguageSupported / isExtensionSupported", () => {
    it("returns true for supported languages and extensions", () => {
      expect(isLanguageSupported("go")).toBe(true);
      expect(isLanguageSupported("csharp")).toBe(true);
      expect(isExtensionSupported(".go")).toBe(true);
      expect(isExtensionSupported(".cs")).toBe(true);
    });

    it("returns false for unsupported languages and extensions", () => {
      expect(isLanguageSupported("unknown")).toBe(false);
      expect(isExtensionSupported(".unknown")).toBe(false);
    });
  });
});

describe("Go Syntax", () => {
  describe("stripComments", () => {
    it("removes line comments", async () => {
      const content = `package main // this is a comment
func main() { // another comment
}`;
      const result = await goSyntax.stripComments(content);
      expect(result).not.toContain("this is a comment");
      expect(result).not.toContain("another comment");
      expect(result).toContain("package main");
      expect(result).toContain("func main()");
    });

    it("removes block comments", async () => {
      const content = `/* Block comment */
func example() {
  /* multi
     line
     comment */
  return
}`;
      const result = await goSyntax.stripComments(content);
      expect(result).not.toContain("Block comment");
      expect(result).not.toContain("multi");
      expect(result).toContain("func example()");
    });

    it("preserves string literals", async () => {
      const content = `const msg = "Hello world"
const path = "/path/to/file"`;
      const result = await goSyntax.stripComments(content);
      // Strings should now be preserved
      expect(result).toContain("Hello world");
      expect(result).toContain("/path/to/file");
      expect(result).toContain("const msg");
    });

    it("preserves raw string literals", async () => {
      const content = "const sql = `SELECT * FROM users WHERE name = 'test'`";
      const result = await goSyntax.stripComments(content);
      // Raw strings should now be preserved
      expect(result).toContain("SELECT");
      expect(result).toContain("const sql");
    });

    it("handles license comment (the false positive case)", async () => {
      const content = `// Copyright 2025. All rights reserved.
// Use of this source code is governed by a BSD-style license.
package main`;
      const result = await goSyntax.stripComments(content);
      expect(result).not.toContain("Use");  // The word "Use" should be stripped
      expect(result).toContain("package main");
    });
  });

  describe("isFrameworkType", () => {
    it("identifies built-in types", () => {
      expect(goSyntax.isFrameworkType("string")).toBe(true);
      expect(goSyntax.isFrameworkType("int")).toBe(true);
      expect(goSyntax.isFrameworkType("bool")).toBe(true);
      expect(goSyntax.isFrameworkType("error")).toBe(true);
    });

    it("identifies built-in functions and constants", () => {
      expect(goSyntax.isFrameworkType("make")).toBe(true);
      expect(goSyntax.isFrameworkType("append")).toBe(true);
      expect(goSyntax.isFrameworkType("nil")).toBe(true);
    });

    it("does not match user-defined or stdlib types", () => {
      expect(goSyntax.isFrameworkType("MyHandler")).toBe(false);
      expect(goSyntax.isFrameworkType("Handler")).toBe(false);
      expect(goSyntax.isFrameworkType("Request")).toBe(false);
      expect(goSyntax.isFrameworkType("UserService")).toBe(false);
    });
  });
});

describe("C Syntax", () => {
  describe("stripComments", () => {
    it("removes C-style comments", async () => {
      const content = `/* Header comment */
int main() {
  // line comment
  return 0;
}`;
      const result = await cSyntax.stripComments(content);
      expect(result).not.toContain("Header comment");
      expect(result).not.toContain("line comment");
      expect(result).toContain("int main()");
    });

    it("preserves string literals", async () => {
      const content = `printf("Hello %s", name);
char c = 'x';`;
      const result = await cSyntax.stripComments(content);
      // Strings should now be preserved
      expect(result).toContain("Hello");
      expect(result).toContain("printf");
    });
  });
});

describe("C# Syntax", () => {
  describe("stripComments", () => {
    it("removes XML doc comments", async () => {
      const content = `/// <summary>
/// This is documentation
/// </summary>
public class MyClass { }`;
      const result = await csharpSyntax.stripComments(content);
      expect(result).not.toContain("summary");
      expect(result).not.toContain("documentation");
      expect(result).toContain("public class MyClass");
    });

    it("preserves verbatim strings", async () => {
      const content = `var path = @"C:\\Users\\test";
var sql = @"SELECT * FROM users";`;
      const result = await csharpSyntax.stripComments(content);
      // Strings should now be preserved (important for interpolated strings)
      expect(result).toContain("Users");
      expect(result).toContain("SELECT");
    });
  });
});

