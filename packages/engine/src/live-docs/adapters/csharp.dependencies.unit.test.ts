/**
 * Unit tests for C# dependency extraction module.
 *
 * Tests cover configuration references, Type.GetType() calls, type name
 * literals, Hangfire job targets, and the lookup of the nearest configuration file.
 */

import { describe, expect, it } from "vitest";

import {
  collectConfigKeys,
  collectConfigurationIndexerKeys,
  collectTypeNameLiterals,
  collectHangfireTargets,
  collectTypeIdentifiers,
  locateNearestFile,
  resolveReflectionTargets
} from "./csharp.dependencies";

describe("csharp.dependencies unit tests", () => {
  describe("collectConfigKeys", () => {
    it("collects keys matching the pattern", () => {
      const pattern = /ConfigurationManager\.AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
      const content = `
        var key1 = ConfigurationManager.AppSettings["Setting1"];
        var key2 = ConfigurationManager.AppSettings["Setting2"];
      `;
      const keys = collectConfigKeys(pattern, content);
      expect(keys.size).toBe(2);
      expect(keys.has("Setting1")).toBe(true);
      expect(keys.has("Setting2")).toBe(true);
    });

    it("deduplicates repeated keys", () => {
      const pattern = /ConfigurationManager\.AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
      const content = `
        var a = ConfigurationManager.AppSettings["Key"];
        var b = ConfigurationManager.AppSettings["Key"];
      `;
      const keys = collectConfigKeys(pattern, content);
      expect(keys.size).toBe(1);
    });

    it("returns empty set for no matches", () => {
      const pattern = /ConfigurationManager\.AppSettings\s*\[\s*"([^"]+)"\s*\]/g;
      const keys = collectConfigKeys(pattern, "no config here");
      expect(keys.size).toBe(0);
    });

    it("resets pattern lastIndex", () => {
      const pattern = /test(\d+)/g;
      const content = "test1 test2";
      collectConfigKeys(pattern, content);
      // Should be able to use pattern again without issues
      const keys2 = collectConfigKeys(pattern, content);
      expect(keys2.size).toBe(2);
    });
  });

  describe("collectConfigurationIndexerKeys", () => {
    it("collects keys from config indexer patterns", () => {
      const content = `
        var value = configuration["ConnectionStrings:Default"];
        var other = _config["ApiKey"];
      `;
      const keys = collectConfigurationIndexerKeys(content);
      expect(keys.has("ConnectionStrings:Default")).toBe(true);
      expect(keys.has("ApiKey")).toBe(true);
    });

    it("only matches identifiers containing 'config'", () => {
      const content = `
        var a = config["Key1"];
        var b = Configuration["Key2"];
        var c = _configuration["Key3"];
        var d = settings["Key4"];
      `;
      const keys = collectConfigurationIndexerKeys(content);
      expect(keys.has("Key1")).toBe(true);
      expect(keys.has("Key2")).toBe(true);
      expect(keys.has("Key3")).toBe(true);
      expect(keys.has("Key4")).toBe(false);
    });

    it("returns empty set for no config indexers", () => {
      const content = "var x = dict[\"key\"];";
      const keys = collectConfigurationIndexerKeys(content);
      expect(keys.size).toBe(0);
    });
  });

  describe("collectTypeNameLiterals", () => {
    it("collects fully-qualified type names in strings", () => {
      const content = `
        var typeName = "MyNamespace.MyClass";
        var other = "AnotherNamespace.SubNamespace.OtherClass";
      `;
      const types = collectTypeNameLiterals(content);
      expect(types.has("MyNamespace.MyClass")).toBe(true);
      expect(types.has("AnotherNamespace.SubNamespace.OtherClass")).toBe(true);
    });

    it("requires all segments to start with uppercase", () => {
      const content = `
        var valid = "Namespace.Class";
        var invalid = "namespace.class";
        var mixed = "Namespace.class";
      `;
      const types = collectTypeNameLiterals(content);
      expect(types.has("Namespace.Class")).toBe(true);
      expect(types.size).toBe(1);
    });

    it("requires at least two segments", () => {
      const content = `var name = "SingleSegment";`;
      const types = collectTypeNameLiterals(content);
      expect(types.size).toBe(0);
    });

    it("skips preceded by word characters", () => {
      const content = `var nameof = nameof("Namespace.Class");`;
      const types = collectTypeNameLiterals(content);
      // "Namespace.Class" would be preceded by '(' so it should be found
      expect(types.has("Namespace.Class")).toBe(true);
    });
  });

  describe("collectHangfireTargets", () => {
    it("collects BackgroundJob.Enqueue targets", () => {
      const content = `
        BackgroundJob.Enqueue<MyWorker>(w => w.DoWork());
        BackgroundJob.Enqueue<AnotherWorker>(w => w.Process());
      `;
      const targets = collectHangfireTargets(content);
      expect(targets.has("MyWorker")).toBe(true);
      expect(targets.has("AnotherWorker")).toBe(true);
    });

    it("collects RecurringJob.AddOrUpdate targets", () => {
      const content = `
        RecurringJob.AddOrUpdate<ScheduledWorker>("id", w => w.Run(), Cron.Daily);
      `;
      const targets = collectHangfireTargets(content);
      expect(targets.has("ScheduledWorker")).toBe(true);
    });

    it("collects IBackgroundJobClient instance calls", () => {
      const content = `
        IBackgroundJobClient client = GetClient();
        client.Enqueue<MyWorker>(w => w.DoWork());
      `;
      const targets = collectHangfireTargets(content);
      expect(targets.has("MyWorker")).toBe(true);
    });

    it("collects IRecurringJobManager instance calls", () => {
      const content = `
        IRecurringJobManager manager = GetManager();
        manager.AddOrUpdate<RecurringWorker>("id", w => w.Run(), Cron.Daily);
      `;
      const targets = collectHangfireTargets(content);
      expect(targets.has("RecurringWorker")).toBe(true);
    });

    it("skips non-Hangfire generic calls", () => {
      const content = `
        var list = new List<MyClass>();
        Something.Enqueue<MyClass>(x => x);
      `;
      const targets = collectHangfireTargets(content);
      expect(targets.has("MyClass")).toBe(false);
    });

    it("deduplicates targets", () => {
      const content = `
        BackgroundJob.Enqueue<Worker>(w => w.Do());
        BackgroundJob.Enqueue<Worker>(w => w.Do());
      `;
      const targets = collectHangfireTargets(content);
      expect(targets.size).toBe(1);
    });
  });

  describe("collectTypeIdentifiers", () => {
    it("collects variable declarations of a type", () => {
      const content = `
        IBackgroundJobClient client = GetClient();
        IBackgroundJobClient otherClient;
      `;
      const identifiers = collectTypeIdentifiers(content, "IBackgroundJobClient");
      expect(identifiers.has("client")).toBe(true);
      expect(identifiers.has("otherClient")).toBe(true);
    });

    it("handles different types", () => {
      const content = `
        IRecurringJobManager manager = GetManager();
        ISomethingElse something = x;
      `;
      const managers = collectTypeIdentifiers(content, "IRecurringJobManager");
      expect(managers.has("manager")).toBe(true);
      expect(managers.size).toBe(1);
    });

    it("returns empty set for no matches", () => {
      const content = "var x = 1;";
      const identifiers = collectTypeIdentifiers(content, "IBackgroundJobClient");
      expect(identifiers.size).toBe(0);
    });
  });

  describe("locateNearestFile", () => {
    it("finds the file in the source file's own folder", () => {
      expect(locateNearestFile("src/file.cs", ["appsettings.json"], new Set(["src/file.cs", "src/appsettings.json"]))).toBe("src/appsettings.json");
    });

    it("climbs to a parent folder", () => {
      expect(locateNearestFile("src/nested/file.cs", ["appsettings.json"], new Set(["src/nested/file.cs", "appsettings.json"]))).toBe("appsettings.json");
    });

    it("tries the candidates in order in each folder", () => {
      expect(locateNearestFile("file.cs", ["App.config", "Web.config"], new Set(["file.cs", "Web.config"]))).toBe("Web.config");
    });

    it("returns undefined when no folder holds one", () => {
      expect(locateNearestFile("file.cs", ["notfound.json"], new Set(["file.cs"]))).toBeUndefined();
    });

    it("finds a file named in another case, as Windows does, in its own spelling, and neither of two that differ by case alone", () => {
      // The index stands for a Windows checkout; it is never asked of the disk, which on Linux tells case apart.
      expect(locateNearestFile("Web/Data/Repository.cs", ["Web.config", "App.config"], new Set(["Web/Data/Repository.cs", "Web/WEB.CONFIG"]))).toBe("Web/WEB.CONFIG");
      expect(locateNearestFile("Web/Data/Repository.cs", ["Web.config", "App.config"], new Set(["Web/Data/Repository.cs", "Web/web.config", "Web/Web.Config", "Web.config"]))).toBeUndefined();
    });

    it("finds nothing without the workspace's files", () => {
      expect(locateNearestFile("file.cs", ["Web.config"], undefined)).toBeUndefined();
    });
  });

  describe("reflection targets", () => {
    describe("resolveReflectionTargets", () => {
      const resolveType = (typeName: string) =>
        typeName === "MyNamespace.MyClass" || typeName === "MyClass"
          ? [{ file: "MyClass.cs", name: "MyClass" }]
          : [];

      it("links each named type to the file that declares it, carrying the type name", () => {
        expect(resolveReflectionTargets(["MyNamespace.MyClass"], resolveType)).toEqual([
          { specifier: "MyClass.cs", resolvedPath: "MyClass.cs", symbols: ["MyClass"], kind: "import" }
        ]);
      });

      it("merges several names that land in the same file", () => {
        expect(resolveReflectionTargets(["MyNamespace.MyClass", "MyClass"], resolveType)).toEqual([
          { specifier: "MyClass.cs", resolvedPath: "MyClass.cs", symbols: ["MyClass"], kind: "import" }
        ]);
      });

      it("returns nothing for names the workspace does not declare", () => {
        expect(resolveReflectionTargets(["MyNamespace.NoSuchClass", ""], resolveType)).toEqual([]);
      });
    });
  });
});
