import { describe, expect, it } from "vitest";

import { bindName, drawSample, isSqlServerOwn, partsOfWritten, searchedSchemas, writtenName } from "./sql-compare";
import type { ScriptDomModule } from "./sql-scriptdom";

describe("the SQL comparison's binding of names, by the order Microsoft documents", () => {
  const archive: ScriptDomModule = { kind: "procedure", name: { schema: "archive", name: "ListOrders" } };

  it("searches a batch's one-part name in the default schema, dbo, and a module's in the module's schema, then dbo", () => {
    expect(searchedSchemas({ how: "select", name: { name: "Orders" } })).toEqual(["dbo"]);
    expect(searchedSchemas({ how: "select", name: { name: "Orders" }, module: archive })).toEqual(["archive", "dbo"]);
    expect(searchedSchemas({ how: "execute", name: { name: "usp_Post" }, module: archive })).toEqual(["archive", "dbo"]);
    expect(searchedSchemas({ how: "select", name: { name: "Orders" }, module: { kind: "procedure", name: { name: "ListOrders" } } })).toEqual(["dbo"]);
  });

  it("takes a trigger's schema from its table when its own name writes none", () => {
    expect(searchedSchemas({ how: "insert", name: { name: "Orders" }, module: { kind: "trigger", name: { name: "OrdersKept" }, on: { schema: "archive", name: "Orders" } } })).toEqual(["archive", "dbo"]);
  });

  it("binds a module's DDL by the default schema, as the user's, not the module's", () => {
    for (const how of ["truncate", "alter-table", "foreign-key"] as const) expect(searchedSchemas({ how, name: { name: "Orders" }, module: archive })).toEqual(["dbo"]);
  });

  it("reads database..name by the default schema in that database, never the module's, and a written schema as itself", () => {
    expect(searchedSchemas({ how: "select", name: { database: "SisterDb", name: "Orders" }, module: archive })).toEqual(["dbo"]);
    expect(searchedSchemas({ how: "select", name: { database: "SisterDb", schema: "dbo", name: "Orders" } })).toEqual(["dbo"]);
    expect(searchedSchemas({ how: "select", name: { schema: "Sales", name: "Orders" }, module: archive })).toEqual(["sales"]);
  });

  it("searches no schema for a linked server's name that omits one, the remote login's default deciding it", () => {
    expect(searchedSchemas({ how: "select", name: { server: "ORACLE_CENTRAL", name: "ACCOUNT" } })).toEqual([]);
    expect(searchedSchemas({ how: "select", name: { server: "ORACLE_CENTRAL", schema: "CENTRAL", name: "ACCOUNT" } })).toEqual(["central"]);
  });

  it("binds to the first schema searched that holds the name, to nothing when neither does, and a schema-less creation as dbo's", () => {
    const created = [
      { named: { schema: "dbo", name: "Orders" } },
      { named: { schema: "archive", name: "Orders" } },
      { named: { schema: "archive", name: "Notes" } },
      { named: { name: "Things" } }
    ];
    const bound = (reference: Parameters<typeof bindName>[0]) => bindName(reference, created).map((object) => `${object.named.schema ?? "(none)"}.${object.named.name}`);
    expect(bound({ how: "select", name: { name: "orders" } })).toEqual(["dbo.Orders"]);
    expect(bound({ how: "select", name: { name: "Orders" }, module: archive })).toEqual(["archive.Orders"]);
    expect(bound({ how: "select", name: { name: "Notes" } })).toEqual([]);
    expect(bound({ how: "select", name: { name: "Notes" }, module: archive })).toEqual(["archive.Notes"]);
    expect(bound({ how: "select", name: { name: "Things" }, module: archive })).toEqual(["(none).Things"]);
    expect(bound({ how: "select", name: { schema: "dbo", name: "Things" } })).toEqual(["(none).Things"]);
    expect(bound({ how: "select", name: { schema: "archive", name: "Things" } })).toEqual([]);
  });
});

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
