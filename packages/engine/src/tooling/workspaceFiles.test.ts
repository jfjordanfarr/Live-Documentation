import { describe, expect, it } from "vitest";

import { readSourceText } from "./sourceText";
import { type FileHost, workspaceReads } from "./workspaceFiles";

/** A host over files held in memory, counting what it is asked; a file named in `failing` fails once with EMFILE. */
function countingHost(files: Record<string, Uint8Array>, failing = new Set<string>()): FileHost & { asked: string[] } {
  const asked: string[] = [];
  const absent = (file: string): Error => Object.assign(new Error(`ENOENT: no such file or directory, open '${file}'`), { code: "ENOENT", syscall: "open", errno: -2 });
  return {
    asked,
    async read(file) {
      asked.push(`read ${file}`);
      if (failing.delete(file)) throw Object.assign(new Error(`EMFILE: too many open files, open '${file}'`), { code: "EMFILE", syscall: "open", errno: -24 });
      if (!(file in files)) throw absent(file);
      return files[file];
    },
    async head(file, bytes) {
      asked.push(`head ${file}`);
      if (!(file in files)) throw absent(file);
      return files[file].subarray(0, bytes);
    }
  };
}

const utf8 = (text: string): Uint8Array => new TextEncoder().encode(text);

describe("a run's reads of its files", () => {
  it("read each file once through the host, decoded once, for every reader that asks", async () => {
    const host = countingHost({ "/ws/a.cs": utf8("class A {}") });
    const reads = workspaceReads(host, 8);
    const [first, second] = await Promise.all([readSourceText("/ws/a.cs", reads), readSourceText("/ws/a.cs", reads)]);
    expect([first, second, await readSourceText("/ws/a.cs", reads)]).toEqual(["class A {}", "class A {}", "class A {}"]);
    expect(host.asked).toEqual(["read /ws/a.cs"]);
    expect(await reads.readingOf("/ws/a.cs")).toEqual({ encoding: "utf-8", text: "class A {}" });
  });

  it("answer a file's first bytes from its whole read, and ask the host for those of a file not read whole, once", async () => {
    const host = countingHost({ "/ws/a.cs": utf8("class A {}"), "/ws/logo.png": Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3, 4, 5]) });
    const reads = workspaceReads(host, 8);
    await reads.readingOf("/ws/a.cs");
    expect(new TextDecoder().decode(await reads.headOf("/ws/a.cs", 5))).toBe("class");
    expect(Array.from(await reads.headOf("/ws/logo.png", 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(Array.from(await reads.headOf("/ws/logo.png", 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
    // Longer than what a whole read keeps: the host is asked.
    expect(new TextDecoder().decode(await reads.headOf("/ws/a.cs", 10))).toBe("class A {}");
    expect(host.asked).toEqual(["read /ws/a.cs", "head /ws/logo.png", "head /ws/a.cs"]);
  });

  it("keep no failure: the reader that asked meets it, as the machine's or the file's, and the next to ask reads again", async () => {
    const host = countingHost({ "/ws/a.cs": utf8("class A {}") }, new Set(["/ws/a.cs"]));
    const reads = workspaceReads(host, 8);
    await expect(readSourceText("/ws/a.cs", reads)).rejects.toMatchObject({ code: "EMFILE" });
    expect(await readSourceText("/ws/a.cs", reads)).toBe("class A {}");
    await expect(readSourceText("/ws/missing.cs", reads)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readSourceText("/ws/missing.cs", reads)).rejects.toMatchObject({ code: "ENOENT" });
    expect(host.asked).toEqual(["read /ws/a.cs", "read /ws/a.cs", "read /ws/missing.cs", "read /ws/missing.cs"]);
  });

  it("keep of a file's bytes only its first ones, even when the host hands Node's Buffer, whose slice is a view of the whole", async () => {
    const whole = Buffer.alloc(64 * 1024, 0x61);
    const reads = workspaceReads({ read: async () => whole, head: async () => new Uint8Array() }, 8);
    await reads.readingOf("/ws/big.cs");
    const head = await reads.headOf("/ws/big.cs", 8);
    expect(Array.from(head)).toEqual(Array(8).fill(0x61));
    expect(head.buffer.byteLength).toBe(8);
  });

  it("keep every file for the run, so that a second pass in the same order reads nothing again", async () => {
    const files = { "/ws/a.cs": utf8("aaaa"), "/ws/b.cs": utf8("bbbb") };
    const host = countingHost(files);
    const reads = workspaceReads(host, 8);
    for (let pass = 0; pass < 2; pass += 1) for (const file of Object.keys(files)) await readSourceText(file, reads);
    expect(host.asked).toEqual(["read /ws/a.cs", "read /ws/b.cs"]);
  });

  it("say why bytes are not read as text, by the one reading step's rule", async () => {
    const reads = workspaceReads(countingHost({ "/ws/blob.dat": Uint8Array.from([0x41, 0, 0x42]) }), 8);
    expect((await reads.readingOf("/ws/blob.dat")).encoding).toBe("unread");
    expect(await readSourceText("/ws/blob.dat", reads)).toBe("");
  });
});
