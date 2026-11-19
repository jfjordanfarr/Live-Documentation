import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { isBinaryContent, resolveArchetype } from "./archetype";

describe("sample archetypes", () => {
  const config = normalizeLiveDocumentationConfig({ sampleRoots: ["tests/scenarios"] });

  it.each([
    ["typescript/src/main.ts", "implementation"],
    ["python/main.py", "implementation"],
    ["java/Main.java", "implementation"],
    ["csharp/App.cs", "implementation"],
    ["ruby/lib/main.rb", "implementation"],
    ["go/main.go", "implementation"],
    ["rust/src/main.rs", "implementation"],
    ["c/helpers.h", "implementation"],
    ["catalog.json", "implementation"],
    ["expected/compiler-edges.json", "implementation"],
    ["picture.svg", "implementation"],
    ["typescript/helpers.test.ts", "test"],
    ["python/test_helpers.py", "test"],
    ["java/HelpersTest.java", "test"],
    ["csharp/HelpersTests.cs", "test"],
    ["go/helpers_test.go", "test"],
    ["rust/helpers_test.rs", "test"],
    ["rust/tests/report.rs", "test"],
    ["typescript/__tests__/helpers.ts", "test"],
    ["python/test/helpers.py", "test"],
    ["typescript/tests/config.json", "test"],
    ["ruby/spec/helpers.rb", "test"],
    ["ruby/helpers_spec.rb", "test"],
    ["c/test_helpers.c", "test"]
  ])("retains the role of %s when its collection moves beneath tests/", (file, expected) => {
    expect(resolveArchetype(`tests/fixtures/${file}`, config)).toBe(expected);
    expect(resolveArchetype(`tests/scenarios/${file}`, config)).toBe(expected);
  });

  it("does not change neighboring test directories or similarly prefixed names", () => {
    expect(resolveArchetype("tests/scenarios-other/main.ts", config)).toBe("test");
    expect(resolveArchetype("tests/unit/catalog.json", config)).toBe("test");
    expect(resolveArchetype("app/main.ts", config)).toBe("implementation");
  });

  it("respects explicit role overrides ahead of sample conventions", () => {
    const overridden = normalizeLiveDocumentationConfig({
      sampleRoots: ["tests/scenarios"],
      archetypeOverrides: { "tests/scenarios/special.json": "implementation" }
    });
    expect(resolveArchetype("tests/scenarios/special.json", overridden)).toBe("implementation");
  });

  it("supports a sample opened as its own workspace", () => {
    const standalone = normalizeLiveDocumentationConfig({ sampleRoots: ["."] });
    expect(resolveArchetype("src/main.ts", standalone)).toBe("implementation");
    expect(resolveArchetype("expected/compiler-edges.json", standalone)).toBe("implementation");
    expect(resolveArchetype("src/helpers.test.ts", standalone)).toBe("test");
  });
});

describe("test folders and test names", () => {
  const config = normalizeLiveDocumentationConfig({});

  it("reads the test-folder pattern against the folders alone, never against the file's own name", () => {
    // PowerShell names a function for its approved verb, and a file for its function: Test-DbaPath is working code.
    expect(resolveArchetype("public/Test-DbaPath.ps1", config)).toBe("implementation");
    expect(resolveArchetype("private/functions/flowcontrol/Test-Bound.ps1", config)).toBe("implementation");
    // tSQLt's own view of the tests it holds is part of the framework.
    expect(resolveArchetype("Source/tSQLt.Tests.view.sql", config)).toBe("implementation");
    expect(resolveArchetype("tests/Get-Thing.ps1", config)).toBe("test");
    expect(resolveArchetype("src/__tests__/helpers.ts", config)).toBe("test");
    expect(resolveArchetype("Test/Helpers/Fake.cs", config)).toBe("test");
  });

  it("keeps a file named for the word alone a test, as JavaScript's and Django's conventions name them", () => {
    expect(resolveArchetype("mode/css/test.js", config)).toBe("test");
    expect(resolveArchetype("polls/tests.py", config)).toBe("test");
    expect(resolveArchetype("Examples/Tests.sql", config)).toBe("test");
  });

  it("keeps each language's name conventions: C#'s FooTests.cs, Java's FooTest.java and Pester's Name.Tests.ps1", () => {
    expect(resolveArchetype("src/Estate/ParcelTests.cs", config)).toBe("test");
    expect(resolveArchetype("src/main/java/HelpersTest.java", config)).toBe("test");
    expect(resolveArchetype("public/Get-Thing.Tests.ps1", config)).toBe("test");
  });
});

describe("binary files are assets, wherever they lie", () => {
  const config = normalizeLiveDocumentationConfig({ sampleRoots: ["tests/scenarios"] });

  it("calls a binary file an asset inside a sample, outside one and under a test folder, and a text file by its place", () => {
    expect(resolveArchetype("tests/scenarios/picture.png", config, true)).toBe("asset");
    expect(resolveArchetype("src/logo.png", config, true)).toBe("asset");
    expect(resolveArchetype("tests/unit/fixture.bin", config, true)).toBe("asset");
    expect(resolveArchetype("tests/scenarios/picture.svg", config, false)).toBe("implementation");
    expect(resolveArchetype("src/logo.svg", config)).toBe("implementation");
  });

  it("lets an override name a binary file's role ahead of its content", () => {
    const overridden = normalizeLiveDocumentationConfig({ archetypeOverrides: { "src/font.woff2": "implementation" } });
    expect(resolveArchetype("src/font.woff2", overridden, true)).toBe("implementation");
  });

  it("reads the content as git does: a NUL byte in the head is binary, a byte order mark of UTF-16 or UTF-32 is text", () => {
    const text = (value: string): Uint8Array => new TextEncoder().encode(value);
    expect(isBinaryContent(text("function Get-Thing { 'x' }\n"))).toBe(false);
    expect(isBinaryContent(text("\ufeffcaf\u00e9 with a BOM\n"))).toBe(false);
    expect(isBinaryContent(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]))).toBe(true);
    expect(isBinaryContent(new Uint8Array([0xff, 0xfe, 0x66, 0x00, 0x75, 0x00]))).toBe(false);
    expect(isBinaryContent(new Uint8Array([0xfe, 0xff, 0x00, 0x66, 0x00, 0x75]))).toBe(false);
    expect(isBinaryContent(new Uint8Array([0x00, 0x00, 0xfe, 0xff, 0x00, 0x00, 0x00, 0x66]))).toBe(false);
    expect(isBinaryContent(new Uint8Array(0))).toBe(false);
    const late = new Uint8Array(9000).fill(0x61);
    late[8500] = 0;
    expect(isBinaryContent(late)).toBe(false);
    late[7999] = 0;
    expect(isBinaryContent(late)).toBe(true);
  });
});
