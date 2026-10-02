import { describe, expect, it } from "vitest";

import { resolveArchetype } from "./archetype";
import { normalizeLiveDocumentationConfig } from "../config/liveDocumentationConfig";

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
    ["catalog.json", "asset"],
    ["expected/compiler-edges.json", "asset"],
    ["picture.svg", "asset"],
    ["typescript/helpers.test.ts", "test"],
    ["python/test_helpers.py", "test"],
    ["java/HelpersTest.java", "test"],
    ["csharp/HelpersTests.cs", "test"],
    ["go/helpers_test.go", "test"],
    ["rust/helpers_test.rs", "test"],
    ["rust/tests/report.rs", "test"],
    ["typescript/__tests__/helpers.ts", "test"],
    ["python/test/helpers.py", "test"],
    ["typescript/tests/config.json", "asset"],
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
    expect(resolveArchetype("expected/compiler-edges.json", standalone)).toBe("asset");
    expect(resolveArchetype("src/helpers.test.ts", standalone)).toBe("test");
  });
});
