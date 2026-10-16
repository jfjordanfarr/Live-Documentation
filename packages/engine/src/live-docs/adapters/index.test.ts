import { describe, expect, it } from "vitest";

import { LANGUAGE_ADAPTERS } from "./index";
import { LIVE_DOCUMENTATION_SOURCE_EXTENSIONS } from "../../config/liveDocumentationConfig";

describe("the adapter registry", () => {
  it("has a default glob for every extension an adapter reads, so that a cold run reaches every file the generator can describe", () => {
    const withoutGlob = LANGUAGE_ADAPTERS.flatMap((adapter) =>
      adapter.extensions
        .filter((extension) => !LIVE_DOCUMENTATION_SOURCE_EXTENSIONS.includes(extension))
        .map((extension) => `${adapter.id} reads ${extension}`)
    );
    expect(withoutGlob).toEqual([]);
  });

  it("declares every extension lowercase with its dot, as the registry matches them", () => {
    for (const adapter of LANGUAGE_ADAPTERS) {
      expect(adapter.extensions.length, adapter.id).toBeGreaterThan(0);
      for (const extension of adapter.extensions) {
        expect(extension, adapter.id).toMatch(/^\.[a-z0-9]+$/u);
      }
    }
  });
});
