import { describe, expect, it } from "vitest";

import { throwIfMachineFailure } from "../tooling/sourceText";
import { failedCall, machineFailure } from "./processMark";

/** A failed system call as node makes one: its code and the call named on the error. */
const failed = (code: string): Error => Object.assign(new Error(`${code}: a failed call, open 'src/a.ts'`), { code, syscall: "open" });

/** An error of a library's own that keeps the failure it met as its `cause`. */
const wrapped = (cause: unknown): Error => new Error("the library could not read its file", { cause });

describe("a failure of the machine's, told from the file's", () => {
  it("is a failed call for any cause but the name's or the path's, whether thrown as it is or wrapped by a library", () => {
    expect(machineFailure(failed("EMFILE"))).toBe(true);
    expect(machineFailure(failed("ENAMETOOLONG"))).toBe(false);
    expect(machineFailure(new Error("Maximum call stack size exceeded"))).toBe(false);
    // Until 2026-11-20 only the error itself was read: a failed call a library wrapped sorted as the file's.
    expect(machineFailure(wrapped(failed("EMFILE")))).toBe(true);
    expect(machineFailure(wrapped(wrapped(failed("EBUSY"))))).toBe(true);
    expect(machineFailure(wrapped(failed("ENAMETOOLONG")))).toBe(false);
    expect(failedCall(wrapped(failed("EACCES")))).toBe("EACCES");
  });

  it("ends at a chain of causes that turns back on itself", () => {
    const first = new Error("first");
    const second = new Error("second", { cause: first });
    (first as Error & { cause?: unknown }).cause = second;
    expect(machineFailure(first)).toBe(false);
  });

  it("is thrown on by a reader's catch, and absence, wrapped or not, is the file's answer", () => {
    expect(() => throwIfMachineFailure(wrapped(failed("EMFILE")))).toThrow("the library could not read its file");
    expect(() => throwIfMachineFailure(failed("ENOENT"))).not.toThrow();
    expect(() => throwIfMachineFailure(wrapped(failed("ENOENT")))).not.toThrow();
  });
});
