import { describe, expect, it } from "vitest";

import { drawSample, isSqlServerOwn, partsOfWritten, writtenName } from "./sql-compare";

describe("the SQL comparison's names", () => {
  it("writes a parser's name as the product writes one, bracketing only a part that would split", () => {
    expect(writtenName({ schema: "dbo", name: "Payment" })).toBe("dbo.Payment");
    expect(writtenName({ server: "ORACLE_CENTRAL", schema: "CENTRAL", name: "ACCOUNT" })).toBe("ORACLE_CENTRAL..CENTRAL.ACCOUNT");
    expect(writtenName({ database: "Billing", name: "Invoice" })).toBe("Billing..Invoice");
    expect(writtenName({ schema: "tests", name: "test it doesn't fail" })).toBe("tests.test it doesn't fail");
    expect(writtenName({ schema: "tests", name: "test fn.sums" })).toBe("tests.[test fn.sums]");
    expect(writtenName({ schema: "tests", name: "a]b" })).toBe("tests.[a]]b]");
  });

  it("reads a written name back into the parts it was written from", () => {
    expect(partsOfWritten("ORACLE_CENTRAL..CENTRAL.ACCOUNT")).toEqual(["ORACLE_CENTRAL", "", "CENTRAL", "ACCOUNT"]);
    expect(partsOfWritten("tests.[test fn.sums]")).toEqual(["tests", "test fn.sums"]);
    expect(partsOfWritten("tests.[a]]b]")).toEqual(["tests", "a]b"]);
    expect(partsOfWritten("tests.test it doesn't fail")).toEqual(["tests", "test it doesn't fail"]);
  });

  it("takes SQL Server's system schemas and the xml type's methods as SQL Server's own, and nothing else", () => {
    expect(isSqlServerOwn({ how: "select", name: { schema: "sys", name: "objects" } })).toBe(true);
    expect(isSqlServerOwn({ how: "execute", name: { database: "master", schema: "sys", name: "sp_executesql" } })).toBe(true);
    expect(isSqlServerOwn({ how: "select", name: { schema: "INFORMATION_SCHEMA", name: "COLUMNS" } })).toBe(true);
    expect(isSqlServerOwn({ how: "call", name: { schema: "r", name: "value" } })).toBe(true);
    expect(isSqlServerOwn({ how: "select", name: { schema: "r", name: "value" } })).toBe(false);
    expect(isSqlServerOwn({ how: "execute", name: { name: "sp_executesql" } })).toBe(false);
    expect(isSqlServerOwn({ how: "call", name: { schema: "dbo", name: "fn_Balance" } })).toBe(false);
  });

  it("draws the same sample for the same seed, and a different one for another", () => {
    const files = Array.from({ length: 50 }, (_, index) => `f${String(index).padStart(2, "0")}.sql`);
    const first = drawSample(files, 20, 1119);
    expect(first).toHaveLength(20);
    expect(drawSample([...files].reverse(), 20, 1119)).toEqual(first);
    expect(drawSample(files, 20, 1120)).not.toEqual(first);
  });
});
