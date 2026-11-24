import path from "node:path";
import { describe, expect, it } from "vitest";

import type { FileHost, FolderEntries } from "./workspaceFiles";
import { compileGlobPatterns, expandGlobBraces, matchesAnyGlob, matchGlobPattern, walkWorkspace } from "./workspaceWalk";

/** Builds a pure in-memory {@link FileHost} over a folder table and records every folder asked of `entries()`. */
function memoryHost(
  root: string,
  tree: Record<string, FolderEntries | Error>
): { host: FileHost; listed: string[] } {
  const resolvedRoot = path.resolve(root);
  const listed: string[] = [];
  const host: FileHost = {
    read: () => Promise.reject(new Error("read not expected during walk")),
    head: () => Promise.reject(new Error("head not expected during walk")),
    entries: async (absoluteFolder) => {
      const relative = path.relative(resolvedRoot, absoluteFolder).split(path.sep).join("/");
      const key = relative === "." ? "" : relative;
      listed.push(key);
      const value = tree[key];
      if (value instanceof Error) throw value;
      if (!value) {
        throw Object.assign(new Error(`ENOENT: no such file or directory, scandir '${absoluteFolder}'`), { code: "ENOENT", syscall: "scandir", path: absoluteFolder });
      }
      return value;
    }
  };
  return { host, listed };
}

describe("in-memory glob matching", () => {
  it("expands simple, chained and nested brace groups while leaving single-item or unclosed braces literal", () => {
    expect(expandGlobBraces("src/**/*.{ts,tsx}")).toEqual(["src/**/*.ts", "src/**/*.tsx"]);
    expect(expandGlobBraces("{a,b}/{c,d}.ts")).toEqual(["a/c.ts", "a/d.ts", "b/c.ts", "b/d.ts"]);
    expect(expandGlobBraces("src/*.{ts,{j,m}s}")).toEqual(["src/*.ts", "src/*.js", "src/*.ms"]);
    expect(expandGlobBraces("src/{single}/a.ts")).toEqual(["src/{single}/a.ts"]);
    expect(expandGlobBraces("src/{unclosed.ts")).toEqual(["src/{unclosed.ts"]);
  });

  it("matches globstars, dotfiles, character classes, metacharacters, leading ./ and filenames with newlines", () => {
    expect(matchGlobPattern("src/app.ts", "**/*")).toBe(true);
    expect(matchGlobPattern(".devcontainer/devcontainer.json", "**/*")).toBe(true);
    expect(matchGlobPattern("a.ts", "./**/*.ts")).toBe(true);
    expect(matchGlobPattern("src/nested/a.ts", "./**/*.ts")).toBe(true);
    expect(matchGlobPattern("src/a1.ts", "src/a?.ts")).toBe(true);
    expect(matchGlobPattern("src/a12.ts", "src/a?.ts")).toBe(false);
    expect(matchGlobPattern("src/b.ts", "src/[a-c].ts")).toBe(true);
    expect(matchGlobPattern("src/d.ts", "src/[!a-c].ts")).toBe(true);
    expect(matchGlobPattern("src/a.ts", "src/[!a-c].ts")).toBe(false);
    expect(matchGlobPattern("app/(auth)/page+1.$ts", "app/(auth)/*.?ts")).toBe(true);
    expect(matchGlobPattern("dir/line1\nline2.ts", "**/*.ts")).toBe(true);
    // Folder-only trailing-slash patterns never match files.
    expect(matchGlobPattern("dist/out.js", "dist/")).toBe(false);
    expect(matchesAnyGlob("src/a.tsx", compileGlobPatterns(["src/**/*.{ts,tsx}"]))).toBe(true);
  });
});

describe("walkWorkspace", () => {
  it("prunes folders before listing via shouldEnter and pattern prefix, returns UTF-16 order and rootFiles", async () => {
    const root = "/virtual/workspace";
    const { host, listed } = memoryHost(root, {
      "": { files: [".gitignore", "README.md"], folders: ["packages", "src", "docs"] },
      "packages": { files: ["huge.ts"], folders: ["Newtonsoft.Json"] },
      "packages/Newtonsoft.Json": { files: ["lib.cs"], folders: [] },
      "src": { files: ["b.ts", "a.ts", "note.txt"], folders: ["sub"] },
      "src/sub": { files: ["c.ts"], folders: [] },
      "docs": { files: ["guide.md"], folders: [] }
    });

    const result = await walkWorkspace({
      workspaceRoot: root,
      host,
      patterns: ["src/**/*.ts"],
      shouldEnter: (folder) => folder !== "packages"
    });

    expect(result.files.map((entry) => entry.relative)).toEqual(["src/a.ts", "src/b.ts", "src/sub/c.ts"]);
    expect(result.files[0].absolute).toBe(path.join(path.resolve(root), "src/a.ts"));
    expect([...(result.rootFiles ?? [])].sort()).toEqual([".gitignore", "README.md"]);
    expect(result.unreadable).toEqual([]);
    // Neither `packages` (pruned by shouldEnter) nor `docs` (pruned by `src/**/*.ts` prefix) was ever listed.
    expect(listed).toEqual(["", "src", "src/sub"]);
  });

  it("never follows linkedFolders for leading ** patterns, follows once for non-leading patterns, and never nests inside a followed link", async () => {
    const root = "/virtual/links";
    const { host, listed } = memoryHost(root, {
      "": { files: [], folders: ["open", "src"] },
      "src": { files: ["real.ts"], folders: [] },
      "open": { files: [], folders: [], linkedFolders: ["link"] },
      "open/link": { files: ["target.ts"], folders: [], linkedFolders: ["nested"] },
      "open/link/nested": { files: ["loop.ts"], folders: [] }
    });

    const starStar = await walkWorkspace({ workspaceRoot: root, host, patterns: ["**/*.ts"] });
    expect(starStar.files.map((entry) => entry.relative)).toEqual(["src/real.ts"]);
    expect(listed).not.toContain("open/link");

    listed.length = 0;
    const explicit = await walkWorkspace({ workspaceRoot: root, host, patterns: ["*/**/*.ts"] });
    expect(explicit.files.map((entry) => entry.relative)).toEqual(["open/link/target.ts", "src/real.ts"]);
    expect(listed).toContain("open/link");
    expect(listed).not.toContain("open/link/nested");
  });

  it("records scandir machine failures in unreadable, reads ENOENT as empty, and rethrows stat machine failures", async () => {
    const root = "/virtual/errors";
    const eacces = Object.assign(new Error("EACCES: permission denied, scandir"), { code: "EACCES", syscall: "scandir" });
    const enoent = Object.assign(new Error("ENOENT: gone, scandir"), { code: "ENOENT", syscall: "scandir" });
    const { host } = memoryHost(root, {
      "": { files: ["a.ts"], folders: ["locked", "gone", "ok"] },
      "locked": eacces,
      "gone": enoent,
      "ok": { files: ["b.ts"], folders: [] }
    });

    const result = await walkWorkspace({ workspaceRoot: root, host, patterns: ["**/*.ts"] });
    expect(result.files.map((entry) => entry.relative)).toEqual(["a.ts", "ok/b.ts"]);
    expect(result.unreadable).toHaveLength(1);
    expect(result.unreadable[0]).toMatchObject({ relative: "locked", error: { code: "EACCES" } });

    const statError = Object.assign(new Error("EACCES: permission denied, stat"), { code: "EACCES", syscall: "stat" });
    const { host: statHost } = memoryHost(root, {
      "": { files: [], folders: ["badlink"] },
      "badlink": statError
    });
    await expect(walkWorkspace({ workspaceRoot: root, host: statHost, patterns: ["**/*.ts"] })).rejects.toMatchObject({ code: "EACCES", syscall: "stat" });
  });
});
