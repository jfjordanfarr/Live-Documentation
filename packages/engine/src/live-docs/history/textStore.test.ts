import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { textHash } from "./summary";
import { putTexts, readText, textPath } from "./textStore";

let store: string;

beforeEach(async () => {
  store = await fs.mkdtemp(path.join(os.tmpdir(), "history-texts-"));
});

afterEach(async () => {
  await fs.rm(store, { recursive: true, force: true });
});

describe("the text store", () => {
  it("keeps each text once under the hash of its content, and reads it back", async () => {
    const texts = new Map(["### Purpose\nOne.", "### Purpose\nTwo, with an é."].map((text) => [textHash(text), text]));
    expect(await putTexts(store, texts)).toBe(2);
    expect(await putTexts(store, texts)).toBe(0);
    for (const [hash, text] of texts) {
      expect(await readText(store, hash)).toBe(text);
      expect(textPath(store, hash)).toBe(path.join(store, hash.slice(0, 2), hash));
    }
    const folders = await fs.readdir(store);
    expect(folders.every((folder) => /^[0-9a-f]{2}$/u.test(folder))).toBe(true);
  });

  it("refuses a text given under a hash that is not its own", async () => {
    await expect(putTexts(store, new Map([[textHash("one"), "two"]]))).rejects.toThrow("is not the text of that hash");
  });

  it("refuses a stored text that has been changed on disk", async () => {
    const hash = textHash("that day's words");
    await putTexts(store, new Map([[hash, "that day's words"]]));
    await fs.writeFile(textPath(store, hash), "other words", "utf8");
    await expect(readText(store, hash)).rejects.toThrow("is not the text of that hash");
  });

  it("refuses a name that is not a hash, so that no read leaves the store", () => {
    expect(() => textPath(store, "../../etc/passwd")).toThrow("is not the name of a text");
  });
});
