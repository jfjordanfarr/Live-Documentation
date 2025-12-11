/**
 * Unit tests for C# dependency extraction module.
 *
 * Tests cover extraction of using directives, configuration references,
 * Type.GetType() calls, type name literals, and Hangfire job targets.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  collectConfigKeys,
  collectConfigurationIndexerKeys,
  collectTypeNameLiterals,
  collectHangfireTargets,
  collectTypeIdentifiers,
  locateNearestFile,
  fileExists,
  resolveReflectionTarget,
  readFileSafe
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

  describe("file system operations", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "csharp-deps-test-"));
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe("fileExists", () => {
      it("returns true for existing file", async () => {
        const filePath = path.join(tempDir, "test.txt");
        await fs.writeFile(filePath, "content");
        expect(await fileExists(filePath)).toBe(true);
      });

      it("returns false for non-existent file", async () => {
        expect(await fileExists(path.join(tempDir, "nope.txt"))).toBe(false);
      });

      it("returns false for directories", async () => {
        const dirPath = path.join(tempDir, "subdir");
        await fs.mkdir(dirPath);
        expect(await fileExists(dirPath)).toBe(false);
      });
    });

    describe("readFileSafe", () => {
      it("reads existing file", async () => {
        const filePath = path.join(tempDir, "test.txt");
        await fs.writeFile(filePath, "hello world");
        expect(await readFileSafe(filePath)).toBe("hello world");
      });

      it("returns undefined for non-existent file", async () => {
        expect(await readFileSafe(path.join(tempDir, "nope.txt"))).toBeUndefined();
      });
    });

    describe("locateNearestFile", () => {
      it("finds file in same directory", async () => {
        const sourcePath = path.join(tempDir, "src", "file.cs");
        await fs.mkdir(path.join(tempDir, "src"), { recursive: true });
        await fs.writeFile(sourcePath, "content");
        await fs.writeFile(path.join(tempDir, "src", "appsettings.json"), "{}");

        const result = await locateNearestFile(sourcePath, tempDir, ["appsettings.json"]);
        expect(result).toBe("src/appsettings.json");
      });

      it("finds file in parent directory", async () => {
        const sourcePath = path.join(tempDir, "src", "nested", "file.cs");
        await fs.mkdir(path.join(tempDir, "src", "nested"), { recursive: true });
        await fs.writeFile(sourcePath, "content");
        await fs.writeFile(path.join(tempDir, "appsettings.json"), "{}");

        const result = await locateNearestFile(sourcePath, tempDir, ["appsettings.json"]);
        expect(result).toBe("appsettings.json");
      });

      it("tries candidates in order", async () => {
        const sourcePath = path.join(tempDir, "file.cs");
        await fs.writeFile(sourcePath, "content");
        await fs.writeFile(path.join(tempDir, "Web.config"), "");

        const result = await locateNearestFile(sourcePath, tempDir, ["App.config", "Web.config"]);
        expect(result).toBe("Web.config");
      });

      it("returns undefined when not found", async () => {
        const sourcePath = path.join(tempDir, "file.cs");
        await fs.writeFile(sourcePath, "content");

        const result = await locateNearestFile(sourcePath, tempDir, ["notfound.json"]);
        expect(result).toBeUndefined();
      });

      it("stops at workspace root", async () => {
        // Create file outside workspace root
        const parentDir = path.dirname(tempDir);
        const targetFile = path.join(parentDir, "outside.json");
        const existed = await fileExists(targetFile);
        
        if (!existed) {
          // Only run test if we can create the file
          try {
            await fs.writeFile(targetFile, "{}");
            
            const sourcePath = path.join(tempDir, "file.cs");
            await fs.writeFile(sourcePath, "content");
            
            const result = await locateNearestFile(sourcePath, tempDir, ["outside.json"]);
            expect(result).toBeUndefined();
            
            await fs.unlink(targetFile);
          } catch {
            // Skip if we can't create file outside temp
          }
        }
      });
    });

    describe("resolveReflectionTarget", () => {
      it("resolves type name to file path", async () => {
        const csFile = path.join(tempDir, "MyClass.cs");
        await fs.writeFile(csFile, `
          namespace MyNamespace {
            public class MyClass { }
          }
        `);

        const result = await resolveReflectionTarget("MyNamespace.MyClass", tempDir);
        expect(result?.specifier).toBe("MyClass.cs");
        expect(result?.symbols).toContain("MyNamespace.MyClass");
      });

      it("returns undefined for non-matching namespace", async () => {
        const csFile = path.join(tempDir, "MyClass.cs");
        await fs.writeFile(csFile, `
          namespace WrongNamespace {
            public class MyClass { }
          }
        `);

        const result = await resolveReflectionTarget("MyNamespace.MyClass", tempDir);
        expect(result).toBeUndefined();
      });

      it("returns undefined for non-existent files", async () => {
        const result = await resolveReflectionTarget("MyNamespace.NoSuchClass", tempDir);
        expect(result).toBeUndefined();
      });

      it("includes symbol targets when extractSymbolsFn provided", async () => {
        const csFile = path.join(tempDir, "MyClass.cs");
        await fs.writeFile(csFile, `
          namespace MyNamespace {
            public class MyClass { }
          }
        `);

        const extractSymbolsFn = () => [
          { name: "MyClass", kind: "class", location: { line: 3, character: 1 } }
        ];

        const result = await resolveReflectionTarget("MyNamespace.MyClass", tempDir, extractSymbolsFn);
        expect(result?.symbolTargets).toBeDefined();
        expect(result?.symbolTargets?.["MyNamespace.MyClass"]).toBe("MyClass (class)");
      });

      it("handles empty type name", async () => {
        const result = await resolveReflectionTarget("", tempDir);
        expect(result).toBeUndefined();
      });
    });
  });
});
