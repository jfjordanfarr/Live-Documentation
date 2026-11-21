import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { csharpAdapter } from "./csharp";

describe("csharpAdapter", () => {
  let workspaceRoot: string;
  /** The workspace's file index: every file the test wrote. */
  let written: Set<string>;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "csharp-adapter-"));
    written = new Set();
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  async function write(relativePath: string, lines: string[]): Promise<string> {
    const absolutePath = path.join(workspaceRoot, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, `${lines.join("\n")}\n`, "utf8");
    written.add(relativePath);
    return absolutePath;
  }

  async function analyze(relativePath: string) {
    const result = await csharpAdapter.analyze({ absolutePath: path.join(workspaceRoot, relativePath), workspaceRoot, fileIndex: written });
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

    describe("what a file's project lets it see", () => {
      const classic = (references: string[] = []) => [
        "<Project ToolsVersion=\"15.0\" xmlns=\"http://schemas.microsoft.com/developer/msbuild/2003\">",
        "  <ItemGroup>",
        ...references.map((reference) => `    <ProjectReference Include="${reference}" />`),
        "  </ItemGroup>",
        "</Project>"
      ];
      const sdk = (references: string[] = []) => [
        "<Project Sdk=\"Microsoft.NET.Sdk\">",
        "  <ItemGroup>",
        ...references.map((reference) => `    <ProjectReference Include="${reference}" />`),
        "  </ItemGroup>",
        "</Project>"
      ];
      const links = async (file: string) => (await analyze(file)).dependencies.map((entry) => entry.resolvedPath ?? entry.specifier);

      it("links a name to the namesake in the file's own project or a project it references, never to one it cannot see (the estate's two PaymentsControllers)", async () => {
        await write("Contracts/Contracts.csproj", sdk());
        await write("Contracts/PaymentRequest.cs", ["namespace Estate.Contracts { public class PaymentRequest { } }"]);
        await write("Portal/Portal.csproj", classic());
        await write("Portal/Controllers/PaymentsController.cs", ["namespace Estate.Controllers { public class PaymentsController { } }"]);
        await write("Portal/Models/PaymentRequest.cs", ["namespace Estate.Contracts { public class PaymentRequest { } }"]);
        await write("Portal/Pages/Default.aspx.cs", [
          "using Estate.Contracts;",
          "namespace Estate.Controllers { public class Page { PaymentsController controller; PaymentRequest request; } }"
        ]);
        await write("Gateway/Gateway.csproj", classic(["..\\Contracts\\Contracts.csproj"]));
        await write("Gateway/Controllers/PaymentsController.cs", ["namespace Estate.Controllers { public class PaymentsController { } }"]);
        await write("Gateway/Wcf/HubProxy.cs", [
          "using Estate.Contracts;",
          "namespace Estate.Controllers { public class HubProxy { PaymentsController controller; PaymentRequest request; } }"
        ]);

        expect(await links("Portal/Pages/Default.aspx.cs")).toEqual(["Portal/Controllers/PaymentsController.cs", "Portal/Models/PaymentRequest.cs"]);
        expect(await links("Gateway/Wcf/HubProxy.cs")).toEqual(["Contracts/PaymentRequest.cs", "Gateway/Controllers/PaymentsController.cs"]);
      });

      it("sees the references of a reference from an SDK-style project and not from a classic one, as MSBuild passes them to the compiler", async () => {
        await write("Data/Data.csproj", sdk());
        await write("Data/Row.cs", ["namespace Shop.Data { public class Row { } }"]);
        await write("Core/Core.csproj", sdk(["../Data/Data.csproj"]));
        await write("App/App.csproj", classic(["..\\Core\\Core.csproj"]));
        await write("App/Program.cs", ["using Shop.Data;", "namespace Shop { class Program { Row row; } }"]);
        await write("Web/Web.csproj", sdk(["../Core/Core.csproj"]));
        await write("Web/Startup.cs", ["using Shop.Data;", "namespace Shop { class Startup { Row row; } }"]);
        await write("Tool/Tool.csproj", [
          "<Project Sdk=\"Microsoft.NET.Sdk\">",
          "  <PropertyGroup><DisableTransitiveProjectReferences>true</DisableTransitiveProjectReferences></PropertyGroup>",
          "  <ItemGroup><ProjectReference Include=\"../Core/Core.csproj\" /></ItemGroup>",
          "</Project>"
        ]);
        await write("Tool/Run.cs", ["using Shop.Data;", "namespace Shop { class Run { Row row; } }"]);

        expect(await links("App/Program.cs")).toEqual([]);
        expect(await links("Web/Startup.cs")).toEqual(["Data/Row.cs"]);
        expect(await links("Tool/Run.cs")).toEqual([]);
      });

      // The reviewer's case of 2026-11-21: MSBuild gives A no reference, so the compiler cannot see Lib.Thing from A.
      it("sees no project a commented-out reference names", async () => {
        await write("A/A.csproj", ["<Project Sdk=\"Microsoft.NET.Sdk\"><ItemGroup><!-- <ProjectReference Include=\"../B/B.csproj\" /> --></ItemGroup></Project>"]);
        await write("A/UseIt.cs", ["using Lib;", "namespace A { public class UseIt { public Thing Item { get; set; } } }"]);
        await write("B/B.csproj", sdk());
        await write("B/Thing.cs", ["namespace Lib { public class Thing { } }"]);
        expect(await links("A/UseIt.cs")).toEqual([]);
      });

      it("hands the reasons a type name has no link to the run as notices, each subject the name as written, since the run names the file", async () => {
        await write("Data/Data.csproj", sdk());
        await write("Data/Row.cs", ["namespace Shop.Data { public class Row { } }"]);
        await write("Left/Left.csproj", sdk());
        await write("Left/Item.cs", ["namespace Shop.Items { public class Item { } }"]);
        await write("Right/Right.csproj", sdk());
        await write("Right/Item.cs", ["namespace Shop.Items { public class Item { } }"]);
        await write("App/App.csproj", sdk(["../Left/Left.csproj", "../Right/Right.csproj"]));
        await write("App/Program.cs", ["using Shop.Data;", "using Shop.Items;", "namespace Shop { class Program { Row row; Item item; } }"]);

        const analysis = await analyze("App/Program.cs");
        expect(analysis.dependencies.filter((entry) => entry.resolvedPath)).toEqual([]);
        expect(analysis.notices).toEqual([
          { reason: "type names declared only outside the project's reach, left unlinked", subject: "Row" },
          { reason: "type names several projects in reach declare, left unlinked", subject: "Item" }
        ]);
      });

      // Too many open files, a file Windows holds: no property of the project file, so never read as a project that references nothing.
      it("throws a failure of the machine's in reading a project file for its references, and reads one of the file's own as referencing nothing", async () => {
        vi.resetModules();
        const failing = { error: undefined as Error | undefined };
        vi.doMock("../../tooling/sourceText", async (importOriginal) => {
          const actual = await importOriginal<typeof import("../../tooling/sourceText")>();
          return { ...actual, readSourceText: (file: string) => (failing.error !== undefined && file.endsWith("Core.csproj") ? Promise.reject(failing.error) : actual.readSourceText(file)) };
        });
        try {
          const { csharpAdapter: own } = await vi.importActual<typeof import("./csharp")>("./csharp");
          await write("Data/Data.csproj", sdk());
          await write("Data/Row.cs", ["namespace Shop.Data { public class Row { } }"]);
          await write("Core/Core.csproj", sdk(["../Data/Data.csproj"]));
          await write("Web/Web.csproj", sdk(["../Core/Core.csproj"]));
          const startup = await write("Web/Startup.cs", ["using Shop.Data;", "namespace Shop { class Startup { Row row; } }"]);
          // A new index each time, as each generation makes, so that nothing the last read kept is read again.
          const read = async () => (await own.analyze({ absolutePath: startup, workspaceRoot, fileIndex: new Set(written) }))?.dependencies.map((entry) => entry.resolvedPath ?? entry.specifier);
          expect(await read()).toEqual(["Data/Row.cs"]);
          failing.error = Object.assign(new Error("EMFILE: too many open files, open 'Core.csproj'"), { code: "EMFILE", syscall: "open", errno: -24 });
          await expect(read()).rejects.toThrow("EMFILE: too many open files");
          // `Core` read as referencing nothing passes `Data` on to nobody, so `Row` lies outside `Web`'s reach.
          failing.error = new Error("the project file's bytes could not be read");
          expect(await read()).toEqual([]);
        } finally {
          vi.doUnmock("../../tooling/sourceText");
          vi.resetModules();
        }
      });

      it("prefers the own project's declaration, links every half of a partial type, and draws nothing for a true ambiguity", async () => {
        await write("LibA/LibA.csproj", sdk());
        await write("LibA/Helper.cs", ["namespace Shop { public class Helper { } public class Util { } }"]);
        await write("LibB/LibB.csproj", sdk());
        await write("LibB/Helper.cs", ["namespace Shop { public class Helper { } }"]);
        await write("LibC/LibC.csproj", sdk());
        await write("LibC/Order.cs", ["namespace Shop { public partial class Order { } }"]);
        await write("LibC/Order.Lines.cs", ["namespace Shop { public partial class Order { } }"]);
        await write("App/App.csproj", sdk(["../LibA/LibA.csproj", "../LibB/LibB.csproj", "../LibC/LibC.csproj"]));
        await write("App/Util.cs", ["namespace Shop { public class Util { } }"]);
        await write("App/Uses.cs", ["namespace Shop { class Uses { Helper helper; Util util; Order order; } }"]);
        await write("Ref/Ref.csproj", [
          "<Project Sdk=\"Microsoft.NET.Sdk\">",
          "  <ItemGroup><ProjectReference Include=\"../LibB/LibB.csproj\" ReferenceOutputAssembly=\"false\" /></ItemGroup>",
          "</Project>"
        ]);
        await write("Ref/Uses.cs", ["namespace Shop { class RefUses { Helper helper; } }"]);

        expect(await links("App/Uses.cs")).toEqual(["App/Util.cs", "LibC/Order.cs", "LibC/Order.Lines.cs"]);
        expect(await links("Ref/Uses.cs")).toEqual([]);
      });

      it("links a name to the declaration with as many type parameters as the use writes type arguments", async () => {
        await write("Mvc/Mvc.csproj", sdk());
        await write("Mvc/Helpers/DnnHelper.cs", ["namespace Dnn.Mvc { public class DnnHelper { } }"]);
        await write("Mvc/Helpers/DnnHelper{TModel}.cs", ["namespace Dnn.Mvc { public class DnnHelper<TModel> : DnnHelper { } }"]);
        await write("Mvc/Helpers/Pair{TKey,TValue}.cs", ["namespace Dnn.Mvc { public class Pair<TKey, TValue> { } public class Pair { } }"]);
        await write("Mvc/Framework/DnnWebViewPage.cs", ["namespace Dnn.Mvc { public class DnnWebViewPage { public DnnHelper<object> Dnn; } }"]);
        await write("Mvc/Framework/Plain.cs", ["namespace Dnn.Mvc { public class Plain { public DnnHelper Dnn; } }"]);
        await write("Mvc/Framework/Open.cs", ["namespace Dnn.Mvc { public class Open { object a = typeof(DnnHelper<>); object b = typeof(Pair<,>); } }"]);

        expect(await links("Mvc/Framework/DnnWebViewPage.cs")).toEqual(["Mvc/Helpers/DnnHelper{TModel}.cs"]);
        expect(await links("Mvc/Framework/Plain.cs")).toEqual(["Mvc/Helpers/DnnHelper.cs"]);
        expect(await links("Mvc/Framework/Open.cs")).toEqual(["Mvc/Helpers/DnnHelper{TModel}.cs", "Mvc/Helpers/Pair{TKey,TValue}.cs"]);
      });

      // Each answer is the C# compiler's (Roslyn 4.12, by `npm run oracle:csharp`), on these files as written.
      it("looks a name up in each enclosing type's base classes, up the chain and across a project reference, before any namespace or using, as C# does", async () => {
        await write("Core/Core.csproj", sdk());
        await write("Core/Root.cs", ["namespace Shop.Core { public class Root { public class Settings { } } }"]);
        await write("Core/OtherSettings.cs", ["namespace Shop.Other { public class Settings { } public class Options { } }"]);
        await write("Web/Web.csproj", sdk(["../Core/Core.csproj"]));
        await write("Web/Middle.cs", ["using Shop.Core;", "namespace Shop.Web { public class Middle : Root { } }"]);
        await write("Web/Leaf.cs", ["using Shop.Other;", "namespace Shop.Web { public class Leaf : Middle { public Settings Kept { get; set; } } }"]);
        await write("Web/Outer.cs", ["using Shop.Other;", "namespace Shop.Web { public class Outer : Shop.Core.Root { public class Inner { public Settings Kept { get; set; } } } }"]);

        expect(await links("Web/Leaf.cs")).toEqual(["Core/Root.cs", "Web/Middle.cs"]);
        expect(await links("Web/Outer.cs")).toEqual(["Core/Root.cs"]);
      });

      it("takes an interface's nested types into the interfaces that extend it and not into a class that implements it, as C# does", async () => {
        await write("Core/Core.csproj", sdk());
        await write("Core/IShape.cs", ["namespace Shop.Core { public interface IShape { public class Options { } } }"]);
        await write("Core/IShaped.cs", ["using Shop.Other;", "namespace Shop.Core { public interface IShaped : IShape { Options Get(); } }"]);
        await write("Core/OtherSettings.cs", ["namespace Shop.Other { public class Options { } }"]);
        await write("Core/Circle.cs", ["using Shop.Other;", "namespace Shop.Core { public class Circle : IShape { public Options Kept { get; set; } } }"]);

        expect(await links("Core/IShaped.cs")).toEqual(["Core/IShape.cs"]);
        expect(await links("Core/Circle.cs")).toEqual(["Core/IShape.cs", "Core/OtherSettings.cs"]);
      });

      it("searches a namespace's own using directives before the namespaces around it, as C# does (DNN writes every using inside the namespace)", async () => {
        await write("Abstractions/Abstractions.csproj", sdk());
        await write("Abstractions/ClientResources/FileOrder.cs", ["namespace DotNetNuke.Abstractions.ClientResources { public enum FileOrder { } }"]);
        await write("Client/Client.csproj", sdk(["../Abstractions/Abstractions.csproj"]));
        await write("Client/FileOrder.cs", ["namespace DotNetNuke.Web.Client { public enum FileOrder { } }"]);
        await write("Client/Controls/Inside.cs", [
          "namespace DotNetNuke.Web.Client.ClientResourceManagement",
          "{",
          "    using DotNetNuke.Abstractions.ClientResources;",
          "    public class Inside { FileOrder order; }",
          "}"
        ]);
        await write("Client/Controls/Outside.cs", [
          "using DotNetNuke.Abstractions.ClientResources;",
          "namespace DotNetNuke.Web.Client.ClientResourceManagement",
          "{",
          "    public class Outside { FileOrder order; }",
          "}"
        ]);
        await write("Client/Controls/FileScoped.cs", [
          "namespace DotNetNuke.Web.Client.ClientResourceManagement;",
          "using DotNetNuke.Abstractions.ClientResources;",
          "public class FileScoped { FileOrder order; }"
        ]);

        expect(await links("Client/Controls/Inside.cs")).toEqual(["Abstractions/ClientResources/FileOrder.cs"]);
        expect(await links("Client/Controls/Outside.cs")).toEqual(["Client/FileOrder.cs"]);
        expect(await links("Client/Controls/FileScoped.cs")).toEqual(["Abstractions/ClientResources/FileOrder.cs"]);
      });

      it("reads the type arguments of a generic name anywhere in a member access, not only at its end", async () => {
        await write("Library/Library.csproj", sdk());
        await write("Library/EventHandlersContainer.cs", ["namespace Shop { public class EventHandlersContainer<T> { public static EventHandlersContainer<T> Instance; } }"]);
        await write("Library/Users/IFriendshipEventHandlers.cs", ["namespace Shop.Friends { public interface IFriendshipEventHandlers { } }"]);
        await write("Library/EventManager.cs", [
          "using Shop.Friends;",
          "namespace Shop { class EventManager { void Raise() { var all = EventHandlersContainer<IFriendshipEventHandlers>.Instance.ToString(); } } }"
        ]);

        expect(await links("Library/EventManager.cs")).toEqual(["Library/EventHandlersContainer.cs", "Library/Users/IFriendshipEventHandlers.cs"]);
      });

      it("applies a project's global using directives to every file of that project, and to no other project's", async () => {
        await write("Core/Core.csproj", sdk());
        await write("Core/Configuration/AppConfig.cs", ["namespace Shop.Core.Configuration; public static class AppConfig { }"]);
        await write("Web/Web.csproj", classic(["..\\Core\\Core.csproj"]));
        await write("Web/Components/GlobalUsings.cs", ["global using Shop.Core.Configuration;"]);
        await write("Web/Controls/NewPageLink.cs", ["namespace Shop.Web.UI;", "public class NewPageLink { bool Enabled() => AppConfig.Enabled; }"]);
        await write("Admin/Admin.csproj", classic(["..\\Core\\Core.csproj"]));
        await write("Admin/Page.cs", ["namespace Shop.Admin; public class Page { bool Enabled() => AppConfig.Enabled; }"]);

        expect(await links("Web/Controls/NewPageLink.cs")).toEqual(["Core/Configuration/AppConfig.cs"]);
        expect(await links("Admin/Page.cs")).toEqual([]);
      });

      it("keeps today's reading for a file no project holds, except that several namesakes draw nothing", async () => {
        await write("Lib/Thing.cs", ["namespace Shop { public class Thing { } public class Only { } }"]);
        await write("Other/Thing.cs", ["namespace Shop { public class Thing { } }"]);
        await write("Loose.cs", ["namespace Shop { class Loose { Thing thing; Only only; } }"]);

        expect(await links("Loose.cs")).toEqual(["Lib/Thing.cs"]);
      });
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

    // The C# compiler's answer (Roslyn 4.12, by `npm run oracle:csharp`), on these files as written.
    it("resolves an alias to the declaration with as many type parameters as its target writes type arguments", async () => {
      await write("Lib/Helper.cs", ["namespace Lib { public class Helper { } }"]);
      await write("Lib/HelperOfT.cs", ["namespace Lib { public class Helper<T> { } }"]);
      await write("App/UsePlain.cs", ["using H = Lib.Helper;", "namespace App { public class UsePlain { public H Item { get; set; } } }"]);
      await write("App/UseGeneric.cs", ["using HT = Lib.Helper<int>;", "namespace App { public class UseGeneric { public HT Item { get; set; } } }"]);

      expect((await analyze("App/UsePlain.cs")).dependencies.map((entry) => entry.resolvedPath)).toEqual(["Lib/Helper.cs"]);
      expect((await analyze("App/UseGeneric.cs")).dependencies.map((entry) => entry.resolvedPath)).toEqual(["Lib/HelperOfT.cs"]);
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

    it("links a partial class to its peer through members named as `this.member`, and through nothing else that starts at `this` or `base`", async () => {
      await write("Controls/Card.ascx.cs", [
        "namespace Site.Controls",
        "{",
        "    public partial class Card : Site.Controls.CardBase",
        "    {",
        "        protected void Page_Load(object sender, System.EventArgs e)",
        "        {",
        "            this.cmdSave.Click += this.OnSave;",
        "            (this).lblTitle.Text = this.Caption.Trim();",
        "            base.Render();",
        "            ((CardBase)this).Shared = 1;",
        "        }",
        "        private void OnSave(object sender, System.EventArgs e) { }",
        "        private string Caption => \"\";",
        "    }",
        "}"
      ]);
      await write("Controls/Card.ascx.designer.cs", [
        "namespace Site.Controls",
        "{",
        "    public partial class Card",
        "    {",
        "        protected global::System.Web.UI.WebControls.LinkButton cmdSave;",
        "        protected global::System.Web.UI.WebControls.Label lblTitle;",
        "        protected global::System.Web.UI.WebControls.Label Render;",
        "        protected global::System.Web.UI.WebControls.Label Shared;",
        "    }",
        "}"
      ]);
      await write("Controls/CardBase.cs", [
        "namespace Site.Controls { public class CardBase : System.Web.UI.UserControl { public int Shared; } }"
      ]);
      await write("Text/Trim.cs", ["namespace Site.Controls { public class Trim { } }"]);

      const { dependencies } = await analyze("Controls/Card.ascx.cs");

      expect(dependencies).toEqual([
        { specifier: "Controls/Card.ascx.designer.cs", resolvedPath: "Controls/Card.ascx.designer.cs", symbols: ["cmdSave", "lblTitle"], kind: "import" },
        { specifier: "Controls/CardBase.cs",           resolvedPath: "Controls/CardBase.cs",           symbols: ["CardBase"],            kind: "import" }
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

    it("finds a configuration file named in any case, as Windows does, in its own spelling", async () => {
      await write("Shop/WEB.CONFIG", ["<configuration><appSettings><add key=\"AuditMode\" value=\"on\" /></appSettings></configuration>"]);
      await write("Shop/Audit.cs", [
        "using System.Configuration;",
        "namespace Shop { public static class Audit { public static string Mode => ConfigurationManager.AppSettings[\"AuditMode\"]; } }"
      ]);

      expect((await analyze("Shop/Audit.cs")).dependencies).toEqual([
        { specifier: "Shop/WEB.CONFIG", resolvedPath: "Shop/WEB.CONFIG", symbols: ["AuditMode"], kind: "import" }
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

  describe("openings", () => {
    it("publishes the routes a controller serves, from its prefix and its actions' attributes", async () => {
      await write("Gateway/Controllers/PaymentsController.cs", [
        "using System.Web.Http;",
        "namespace Estate.Gateway.Controllers",
        "{",
        "    [RoutePrefix(\"api/payments\")]",
        "    public class PaymentsController : ApiController",
        "    {",
        "        [HttpPost]",
        "        [Route(\"\")]",
        "        public IHttpActionResult Post() => Ok();",
        "        [HttpGet]",
        "        [Route(\"{paymentId:guid}\")]",
        "        public IHttpActionResult Get(string paymentId) => Ok();",
        "        [Route(\"~/api/health\")]",
        "        public IHttpActionResult GetHealth() => Ok();",
        "        [AcceptVerbs(\"PUT\", \"PATCH\")]",
        "        [Route(\"{paymentId}\")]",
        "        public IHttpActionResult Amend(string paymentId) => Ok();",
        "        public IHttpActionResult Helper() => Ok();",
        "    }",
        "}"
      ]);

      const { symbols } = await analyze("Gateway/Controllers/PaymentsController.cs");

      expect(symbols.filter((symbol) => symbol.kind === "route").map((symbol) => `${symbol.name} @${symbol.location?.line}`)).toEqual([
        "POST api/payments @7",
        "GET api/payments/{paymentId} @10",
        "GET api/health @13",
        "PATCH api/payments/{paymentId} @15",
        "PUT api/payments/{paymentId} @15"
      ]);
    });

    it("links a client to the controller that serves what it calls, away from home, observed from a contract", async () => {
      const clientPath = await write("Portal/Services/GatewayClient.cs", [
        "using System;",
        "using System.Net.Http;",
        "using System.Threading.Tasks;",
        "namespace Estate.Portal.Services",
        "{",
        "    public sealed class GatewayClient",
        "    {",
        "        private static readonly HttpClient Http = new HttpClient();",
        "        private readonly Uri baseUrl;",
        "        public const string Receipts = \"api/receipts\";",
        "        public async Task Post(object request) { await Http.PostAsJsonAsync(new Uri(baseUrl, \"api/payments\"), request); }",
        "        public async Task Get(string id) { await Http.GetAsync(new Uri(baseUrl, \"api/payments/\" + id)); }",
        "        public async Task Receipt(string id) { await Http.GetStringAsync($\"{Receipts}/{id}\"); }",
        "        public async Task Ping() { await Http.SendAsync(new HttpRequestMessage(HttpMethod.Head, \"api/health\")); }",
        "        public async Task Missing() { await Http.DeleteAsync(\"api/nothing/1\"); }",
        "    }",
        "}"
      ]);
      const gateway = "Gateway/Controllers/PaymentsController.cs";
      const portal  = "Portal/Controllers/PaymentsController.cs";
      const route   = (sourcePath: string, anchor: string) => ({ liveDocPath: "d", sourcePath, anchor, kind: "route" });
      const symbolIndex = new Map([
        ["POST api/payments",            [route(portal, "symbol-post-apipayments"), route(gateway, "symbol-post-apipayments")]],
        ["GET api/payments/{paymentId}", [route(gateway, "symbol-get-apipaymentspaymentid")]],
        ["GET api/receipts/{id}",        [route(gateway, "symbol-get-apireceiptsid")]],
        ["HEAD api/health",              [route(gateway, "symbol-head-apihealth")]]
      ]);
      const fileIndex = new Set(["Portal/Portal.csproj", "Gateway/Gateway.csproj", "Portal/Services/GatewayClient.cs"]);

      const result = await csharpAdapter.analyze({ absolutePath: clientPath, workspaceRoot, fileIndex, symbolIndex });

      expect(result?.dependencies).toEqual([
        { specifier: gateway, resolvedPath: gateway, symbols: ["GET api/payments/{paymentId}", "GET api/receipts/{id}", "HEAD api/health", "POST api/payments"], kind: "import", basis: "contract" },
        { specifier: "DELETE api/nothing/1", symbols: [], kind: "import", basis: "contract" }
      ]);
    });

    it("links a data context to its connection string and to the procedure and table it names, folding constants, and keeps by name an object nothing declares", async () => {
      await write("PaymentService/App.config", ["<configuration><connectionStrings><add name=\"PaymentsDb\" connectionString=\"x\" /></connectionStrings></configuration>"]);
      const contextPath = await write("PaymentService/Data/PaymentsContext.cs", [
        "using System.Data.Entity;",
        "namespace Estate.Payments.Data",
        "{",
        "    [Table(\"Payment\", Schema = \"dbo\")]",
        "    public class Payment { }",
        "    public class PaymentsContext : DbContext",
        "    {",
        "        public const string ConnectionName = \"PaymentsDb\";",
        "        public const string PostPaymentProcedure = \"dbo.usp_PostPayment\";",
        "        public PaymentsContext() : base(\"name=\" + ConnectionName) { }",
        "        public void Post() { Database.SqlQuery<int>(\"EXEC \" + PostPaymentProcedure + \" @AccountNumber\"); }",
        "        public void Audit() { Database.ExecuteSqlCommand(\"INSERT INTO dbo.Audit (Note) VALUES ('x')\"); }",
        "    }",
        "}"
      ]);
      const symbolIndex = new Map([
        ["dbo.usp_PostPayment", [{ liveDocPath: "d", sourcePath: "Database/dbo.usp_PostPayment.sql", anchor: "symbol-dbousp_postpayment", kind: "procedure" }]],
        ["dbo.Payment",         [{ liveDocPath: "d", sourcePath: "Database/dbo.Payment.sql",         anchor: "symbol-dbopayment",         kind: "table" }]]
      ]);

      const result = await csharpAdapter.analyze({ absolutePath: contextPath, workspaceRoot, fileIndex: written, symbolIndex });

      expect(result?.dependencies).toEqual([
        { specifier: "PaymentService/App.config",       resolvedPath: "PaymentService/App.config",       symbols: ["PaymentsDb"],          kind: "import" },
        { specifier: "Database/dbo.Payment.sql",         resolvedPath: "Database/dbo.Payment.sql",         symbols: ["dbo.Payment"],         kind: "import", basis: "contract" },
        { specifier: "Database/dbo.usp_PostPayment.sql", resolvedPath: "Database/dbo.usp_PostPayment.sql", symbols: ["dbo.usp_PostPayment"], kind: "import", basis: "contract" },
        { specifier: "dbo.Audit",                        symbols: [], kind: "import", basis: "contract" }
      ]);
    });

    // T-SQL's order of search (`bindSqlName`): a name in a C# string is no module's, so it binds as a loose script's does.
    it("binds a one-part SQL name to `dbo`'s object and not to a namesake in another schema, and a two-part name to its own schema's", async () => {
      const callerPath = await write("Reports/Orders.cs", [
        "namespace Shop.Reports",
        "{",
        "    public class Orders",
        "    {",
        "        public void Count() { Database.SqlQuery<int>(\"EXEC CountOrders\"); }",
        "        public void Kept() { Database.SqlQuery<int>(\"SELECT * FROM archive.OrdersKept\"); }",
        "        public void Archived() { Database.SqlQuery<int>(\"EXEC PurgeOrders\"); }",
        "    }",
        "}"
      ]);
      const symbolIndex = new Map([
        ["CountOrders",         [{ liveDocPath: "d", sourcePath: "Database/procs.sql",   anchor: "symbol-countorders",         kind: "procedure" }]],
        ["archive.CountOrders", [{ liveDocPath: "d", sourcePath: "Database/archive.sql", anchor: "symbol-archivecountorders",  kind: "procedure" }]],
        ["archive.OrdersKept",  [{ liveDocPath: "d", sourcePath: "Database/archive.sql", anchor: "symbol-archiveorderskept",   kind: "table" }]],
        ["archive.PurgeOrders", [{ liveDocPath: "d", sourcePath: "Database/archive.sql", anchor: "symbol-archivepurgeorders",  kind: "procedure" }]]
      ]);

      const result = await csharpAdapter.analyze({ absolutePath: callerPath, workspaceRoot, fileIndex: written, symbolIndex });

      expect(result?.dependencies).toEqual([
        { specifier: "Database/archive.sql", resolvedPath: "Database/archive.sql", symbols: ["archive.OrdersKept"], kind: "import", basis: "contract" },
        { specifier: "Database/procs.sql",   resolvedPath: "Database/procs.sql",   symbols: ["CountOrders"],        kind: "import", basis: "contract" },
        { specifier: "PurgeOrders",          symbols: [], kind: "import", basis: "contract" }
      ]);
    });
  });

  describe("program", () => {
    const repoRoot = path.resolve(__dirname, "../../../../..");

    it("reports a static Main as the program's entry, whatever its accessibility and return type", async () => {
      await write("Program.cs", [
        "namespace Shop",
        "{",
        "    class Program",
        "    {",
        "        static void Main(string[] args) { }",
        "    }",
        "}"
      ]);
      await write("Host.cs", [
        "using System.Threading.Tasks;",
        "namespace Shop;",
        "public class Host",
        "{",
        "    private static async Task<int> Main() => 0;",
        "}"
      ]);

      expect((await analyze("Program.cs")).program).toMatchObject({ symbol: "Main" });
      expect((await analyze("Host.cs")).program).toMatchObject({ symbol: "Main" });
    });

    it("reports top-level statements as the program's entry, naming no symbol", async () => {
      await write("Program.cs", [
        "using System;",
        "Console.WriteLine(\"hi\");"
      ]);

      expect((await analyze("Program.cs")).program).toStrictEqual({});
    });

    it("leaves program absent for a type named Main, and for a Main that is not static", async () => {
      await write("Tool.cs", [
        "namespace Shop;",
        "public class Tool",
        "{",
        "    public void Main() { }",
        "    public static void Run() { }",
        "}"
      ]);
      const rosetta = path.join(repoRoot, "tests", "integration", "programs", "csharp", "rosetta");

      expect(await analyze("Tool.cs")).not.toHaveProperty("program");
      const main = await csharpAdapter.analyze({ absolutePath: path.join(rosetta, "src", "App", "Main.cs"), workspaceRoot: rosetta });
      expect(main).not.toBeNull();
      expect(main).not.toHaveProperty("program");
    });
  });
});
