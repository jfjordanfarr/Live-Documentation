import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { csharpAdapter } from "./csharp";

describe("csharpAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "csharp-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  async function write(relativePath: string, lines: string[]): Promise<string> {
    const absolutePath = path.join(workspaceRoot, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, `${lines.join("\n")}\n`, "utf8");
    return absolutePath;
  }

  async function analyze(relativePath: string) {
    const result = await csharpAdapter.analyze({ absolutePath: path.join(workspaceRoot, relativePath), workspaceRoot });
    if (!result) throw new Error("adapter returned null");
    return result;
  }

  describe("symbols", () => {
    it("publishes types, their non-private members, interface members, and XML documentation", async () => {
      await write("Widgets.cs", [
        "using System;",
        "namespace Shop.Widgets",
        "{",
        "    /// <summary>A widget.</summary>",
        "    public sealed class Widget : BaseWidget, IWidget",
        "    {",
        "        public const string Kind = \"widget\";",
        "        private int count;",
        "        internal Widget(string name) { }",
        "        /// <summary>The name.</summary>",
        "        public string Name { get; }",
        "        protected void Touch() { }",
        "        public event EventHandler Changed;",
        "        void Hidden() { }",
        "        public class Nested { }",
        "    }",
        "    public interface IWidget { string Name { get; } void Run(); }",
        "    public enum Status { On, Off }",
        "    public record Snapshot(string Name);",
        "    public delegate void Handler(string message);",
        "}"
      ]);

      const { symbols } = await analyze("Widgets.cs");

      expect(symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual([
        "class Widget",
        "field Kind",
        "constructor Widget",
        "property Name",
        "method Touch",
        "event Changed",
        "class Nested",
        "interface IWidget",
        "property Name",
        "method Run",
        "enum Status",
        "record Snapshot",
        "delegate Handler"
      ]);
      expect(symbols[0].qualifiedName).toBe("Shop.Widgets.Widget");
      expect(symbols[0].documentation?.summary).toBe("A widget.");
      expect(symbols[0].typeReferences).toEqual([
        { name: "BaseWidget", role: "extends" },
        { name: "IWidget",    role: "implements" }
      ]);
      expect(symbols.find((symbol) => symbol.name === "Nested")?.qualifiedName).toBe("Shop.Widgets.Widget.Nested");
      expect(symbols.find((symbol) => symbol.name === "Name")?.documentation?.summary).toBe("The name.");
    });

    it("records parameter and return types, without framework types, and handles file-scoped namespaces", async () => {
      await write("Service.cs", [
        "namespace Shop;",
        "public class Service",
        "{",
        "    public Task<Receipt> Pay(Order order, decimal amount, List<Item> items) => null;",
        "}"
      ]);

      const { symbols } = await analyze("Service.cs");
      const pay = symbols.find((symbol) => symbol.name === "Pay");

      expect(symbols[0].qualifiedName).toBe("Shop.Service");
      expect(pay?.typeReferences).toEqual([
        { name: "Receipt", role: "return" },
        { name: "Order",   role: "parameter", parameterName: "order" },
        { name: "Item",    role: "parameter", parameterName: "items" }
      ]);
    });
  });

  describe("dependencies", () => {
    it("links a file to the files that declare the types it names, by scope", async () => {
      await write("Contracts/Request.cs",   ["namespace Estate.Contracts { public class Request { public string Account { get; set; } } }"]);
      await write("Contracts/Result.cs",    ["namespace Estate.Contracts { public class Result { } }"]);
      await write("Gateway/Settings.cs",    ["namespace Estate.Gateway { public static class Settings { public static string Workload => \"x\"; } }"]);
      await write("Gateway/Proxy.cs", [
        "using System;",
        "using Estate.Contracts;",
        "namespace Estate.Gateway.Wcf",
        "{",
        "    public sealed class Proxy",
        "    {",
        "        public Result Post(Request request)",
        "        {",
        "            request.Account = Settings.Workload;",
        "            var other = new Estate.Contracts.Result();",
        "            return other;",
        "        }",
        "    }",
        "}"
      ]);

      const { dependencies } = await analyze("Gateway/Proxy.cs");

      expect(dependencies).toEqual([
        { specifier: "Contracts/Request.cs", resolvedPath: "Contracts/Request.cs", symbols: ["Request"],  kind: "import" },
        { specifier: "Contracts/Result.cs",  resolvedPath: "Contracts/Result.cs",  symbols: ["Result"],   kind: "import" },
        { specifier: "Gateway/Settings.cs",  resolvedPath: "Gateway/Settings.cs",  symbols: ["Settings"], kind: "import" }
      ]);
    });

    it("prefers the enclosing namespace over a using directive, and never links a file to itself", async () => {
      await write("A/Thing.cs", ["namespace Shop.A { public class Thing { } }"]);
      await write("B/Thing.cs", ["namespace Shop.B { public class Thing { } }"]);
      await write("B/User.cs", [
        "using Shop.A;",
        "namespace Shop.B",
        "{",
        "    public class User { public Thing Item; public User Next; }",
        "}"
      ]);

      const { dependencies } = await analyze("B/User.cs");

      expect(dependencies.map((entry) => entry.resolvedPath)).toEqual(["B/Thing.cs"]);
    });

    it("resolves aliases and attribute names", async () => {
      await write("Audit/AuditAttribute.cs", ["namespace Shop.Audit { public class AuditAttribute : System.Attribute { } }"]);
      await write("Models/Item.cs",          ["namespace Shop.Models { public class Item { } }"]);
      await write("App.cs", [
        "using Product = Shop.Models.Item;",
        "using Shop.Audit;",
        "namespace Shop",
        "{",
        "    [Audit]",
        "    public class App { public Product Current; }",
        "}"
      ]);

      const { dependencies } = await analyze("App.cs");

      expect(dependencies.map((entry) => `${entry.resolvedPath}:${entry.symbols.join(",")}`)).toEqual([
        "Audit/AuditAttribute.cs:AuditAttribute",
        "Models/Item.cs:Item"
      ]);
    });

    it("links a partial class to the peer file that declares the members it uses", async () => {
      await write("Pages/Default.aspx.cs", [
        "namespace Portal.Pages",
        "{",
        "    public partial class Default : System.Web.UI.Page",
        "    {",
        "        protected void Page_Load(object sender, System.EventArgs e) { Toggle.Value = \"on\"; Local(); }",
        "        private void Local() { }",
        "    }",
        "}"
      ]);
      await write("Pages/Default.aspx.designer.cs", [
        "namespace Portal.Pages",
        "{",
        "    public partial class Default",
        "    {",
        "        protected global::System.Web.UI.WebControls.HiddenField Toggle;",
        "    }",
        "}"
      ]);

      const { dependencies } = await analyze("Pages/Default.aspx.cs");

      expect(dependencies).toEqual([
        { specifier: "Pages/Default.aspx.designer.cs", resolvedPath: "Pages/Default.aspx.designer.cs", symbols: ["Toggle"], kind: "import" }
      ]);
    });

    it("lists using directives for namespaces outside the workspace, except System", async () => {
      await write("Job.cs", ["using System.Linq;", "using Hangfire;", "using Newtonsoft.Json;", "namespace Shop { public class Job { } }"]);

      const { dependencies } = await analyze("Job.cs");

      expect(dependencies).toEqual([
        { specifier: "Hangfire",        symbols: [], kind: "import" },
        { specifier: "Newtonsoft.Json", symbols: [], kind: "import" }
      ]);
    });

    it("reads configuration keys held in constants, including constants of another file", async () => {
      await write("Web.config", ["<configuration><appSettings><add key=\"Portal.Url\" value=\"x\" /><add key=\"Portal.Flag\" value=\"y\" /></appSettings></configuration>"]);
      await write("Globals.cs", [
        "using System.Configuration;",
        "namespace Portal",
        "{",
        "    public static class Globals",
        "    {",
        "        public const string UrlKey = \"Portal.Url\";",
        "        public static string Url => ConfigurationManager.AppSettings[UrlKey];",
        "    }",
        "}"
      ]);
      await write("Flags.cs", [
        "using System.Configuration;",
        "namespace Portal",
        "{",
        "    public static class Flags",
        "    {",
        "        public const string FlagKey = \"Portal.Flag\";",
        "        public static string Flag => ConfigurationManager.AppSettings[Globals.UrlKey] + ConfigurationManager.AppSettings[\"Portal.Flag\"];",
        "        public static string Both => ConfigurationManager.AppSettings[FlagKey];",
        "    }",
        "}"
      ]);

      const globals = await analyze("Globals.cs");
      const flags   = await analyze("Flags.cs");

      expect(globals.dependencies).toEqual([
        { specifier: "Web.config", resolvedPath: "Web.config", symbols: ["Portal.Url"], kind: "import" }
      ]);
      expect(flags.dependencies).toEqual([
        { specifier: "Globals.cs", resolvedPath: "Globals.cs", symbols: ["Globals"], kind: "import" },
        { specifier: "Web.config", resolvedPath: "Web.config", symbols: ["Portal.Flag", "Portal.Url"], kind: "import" }
      ]);
    });

    it("links a WCF client to the endpoint it names in configuration", async () => {
      await write("Web.config", ["<configuration><system.serviceModel><client><endpoint name=\"Hub\" contract=\"Shop.IHub\" /></client></system.serviceModel></configuration>"]);
      await write("IHub.cs",   ["namespace Shop { public interface IHub { void Ping(); } }"]);
      await write("Proxy.cs", [
        "using System.ServiceModel;",
        "namespace Shop",
        "{",
        "    public class Proxy",
        "    {",
        "        public const string EndpointName = \"Hub\";",
        "        public void Ping() { var factory = new ChannelFactory<IHub>(EndpointName); factory.CreateChannel().Ping(); }",
        "    }",
        "}"
      ]);

      const { dependencies } = await analyze("Proxy.cs");

      expect(dependencies).toEqual([
        { specifier: "IHub.cs",    resolvedPath: "IHub.cs",    symbols: ["IHub"], kind: "import" },
        { specifier: "Web.config", resolvedPath: "Web.config", symbols: ["Hub"],  kind: "import" }
      ]);
    });

    it("resolves reflection targets named in string literals", async () => {
      await write("Handlers/TelemetryHandler.cs", ["namespace App.Handlers { public sealed class TelemetryHandler { } }"]);
      await write("Factory.cs", [
        "using System;",
        "namespace App",
        "{",
        "    public static class Factory",
        "    {",
        "        public static object Create() => Activator.CreateInstance(Type.GetType(\"App.Handlers.TelemetryHandler\"));",
        "    }",
        "}"
      ]);

      const { dependencies } = await analyze("Factory.cs");

      expect(dependencies).toEqual([
        { specifier: "Handlers/TelemetryHandler.cs", resolvedPath: "Handlers/TelemetryHandler.cs", symbols: ["TelemetryHandler"], kind: "import" }
      ]);
    });
  });
});
