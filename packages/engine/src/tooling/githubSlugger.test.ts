import { describe, expect, it } from "vitest";

import { GitHubSlugger, createSlugger, slug } from "./githubSlugger";

describe("github slugger", () => {
  it("matches GitHub slug casing and punctuation rules", () => {
    expect(slug("Hello World"))
      .toBe("hello-world");
    expect(slug("heading with a period.txt"))
      .toBe("heading-with-a-periodtxt");
    expect(slug("I ♥ unicode"))
      .toBe("i--unicode");
    // GitHub collapses ASCII hyphens when they appear between non-Latin words.
    expect(slug("Привет non-latin 你好"))
      .toBe("привет-nonlatin-你好");
    expect(slug("😄 unicode emoji"))
      .toBe("-unicode-emoji");
  });

  it("respects maintainCase flag", () => {
    expect(slug("FooBar", true)).toBe("FooBar");
    expect(slug("FooBar")).toBe("foobar");
  });

  it("returns empty slug for non-string input", () => {
    // @ts-expect-error verifying runtime guard
    expect(slug(undefined)).toBe("");
    // @ts-expect-error verifying runtime guard
    expect(slug(42)).toBe("");
  });

  it("creates unique slugs with duplicate tracking", () => {
    const slugger = new GitHubSlugger();
    expect(slugger.slug("alpha")).toBe("alpha");
    expect(slugger.slug("alpha")).toBe("alpha-1");
    expect(slugger.slug("alpha")).toBe("alpha-2");

    slugger.reset();
    expect(slugger.slug("alpha")).toBe("alpha");
  });

  it("provides slug context with duplicate indices", () => {
    const slugger = createSlugger();
    const first = slugger.slugWithContext("Topic");
    const second = slugger.slugWithContext("Topic");
    const third = slugger.slugWithContext("Topic");

    expect(first).toEqual({ slug: "topic", base: "topic", index: 0 });
    expect(second).toEqual({ slug: "topic-1", base: "topic", index: 1 });
    expect(third).toEqual({ slug: "topic-2", base: "topic", index: 2 });
  });

  it("handles headings that collapse to empty strings", () => {
    const slugger = createSlugger();
    const empty = slugger.slugWithContext("!!!");
    const duplicateEmpty = slugger.slugWithContext("!!!");

    expect(empty).toEqual({ slug: "", base: "", index: 0 });
    expect(duplicateEmpty).toEqual({ slug: "-1", base: "", index: 1 });
  });
});
