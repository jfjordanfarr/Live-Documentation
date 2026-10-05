import { describe, expect, it } from "vitest";

import { GitHubSlugger, createSlugger, slug, slugText } from "./githubSlugger";

describe("github slugger", () => {
  it("slugs a heading's rendered text, not its markdown", () => {
    // The decisions log's headings carry an emphasized suffix; GitHub's anchor has no underscores from it.
    expect(slug(slugText("The Native Views Are the Base _(Recorded 2026-10-03)_"))).toBe("the-native-views-are-the-base-recorded-2026-10-03");
    expect(slug("The Native Views Are the Base _(Recorded 2026-10-03)_")).toBe("the-native-views-are-the-base-_recorded-2026-10-03_");
    expect(slug(slugText("Use `renderLiveDoc` for [docs](../guide.md) and __strong__ words"))).toBe("use-renderlivedoc-for-docs-and-strong-words");
    expect(slug(slugText("An ![icon](i.png) and a [ref][1] here"))).toBe("an-icon-and-a-ref-here");
    // An underscore inside a word is not emphasis and stays in the slug, as on GitHub.
    expect(slug(slugText("snake_case and __dunder__ and _lead"))).toBe("snake_case-and-dunder-and-lead");
  });

  it("matches GitHub slug casing and punctuation rules", () => {
    expect(slug("Hello World"))
      .toBe("hello-world");
    expect(slug("heading with a period.txt"))
      .toBe("heading-with-a-periodtxt");
    expect(slug("I ♥ unicode"))
      .toBe("i--unicode");
    // Upstream github-slugger preserves literal hyphens, including in mixed scripts.
    expect(slug("Привет non-latin 你好"))
      .toBe("привет-non-latin-你好");
    expect(slug("😄 unicode emoji"))
      .toBe("-unicode-emoji");
  });

  it("preserves date and turn anchors used by provenance links", () => {
    // github-slugger 2.0.0: https://github.com/Flet/github-slugger/blob/2.0.0/regex.js
    expect(slug("2026-09-30")).toBe("2026-09-30");
    expect(slug("Owner · 2026-09-29 15:32 UTC")).toBe("owner--2026-09-29-1532-utc");
    const slugger = createSlugger();
    expect(slugger.slug("a-b")).toBe("a-b");
    expect(slugger.slug("ab")).toBe("ab");
    expect(slugger.slug("a-b")).toBe("a-b-1");
  });

  it("removes the full ASCII punctuation range from colon through at-sign", () => {
    expect(slug("a:b;c<d=e>f?g@h-i_j")).toBe("abcdefgh-i_j");
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
