import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { aspNetMarkupAdapter } from "./aspnet";

describe("aspNetMarkupAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "aspnet-adapter-"));
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("connects Blazor host markup to its code-behind and bundled script", async () => {
    const pagesDir = path.join(workspaceRoot, "Pages");
    const webRootDir = path.join(workspaceRoot, "wwwroot", "js");
    await fs.mkdir(pagesDir, { recursive: true });
    await fs.mkdir(webRootDir, { recursive: true });

    const markupPath = path.join(pagesDir, "_Host.razor");
    const codeBehindPath = `${markupPath}.cs`;
    const scriptPath = path.join(workspaceRoot, "wwwroot", "js", "blazor-telemetry.js");

    await fs.writeFile(
      markupPath,
      [
        "@page \"/\"",
        "<script src=\"~/wwwroot/js/blazor-telemetry.js\"></script>"
      ].join("\n"),
      "utf8"
    );

    await fs.writeFile(
      codeBehindPath,
      [
        "namespace BlazorTelemetry.Pages;",
        "public partial class Host {}"
      ].join("\n"),
      "utf8"
    );

    await fs.writeFile(scriptPath, "console.log('noop');", "utf8");

    const analysis = await aspNetMarkupAdapter.analyze({
      absolutePath: markupPath,
      workspaceRoot,
      fileIndex: new Set(["Pages/_Host.razor", "Pages/_Host.razor.cs", "wwwroot/js/blazor-telemetry.js"])
    });

    expect(analysis).not.toBeNull();
    expect(analysis?.dependencies.map((entry) => entry.resolvedPath)).toEqual(
      expect.arrayContaining([
        "wwwroot/js/blazor-telemetry.js",
        "Pages/_Host.razor.cs"
      ])
    );
  });

  it("publishes element ids as public symbols, server controls and plain HTML alike", async () => {
    const pagesDir = path.join(workspaceRoot, "Pages");
    await fs.mkdir(pagesDir, { recursive: true });
    const markupPath = path.join(pagesDir, "Default.aspx");

    await fs.writeFile(
      markupPath,
      [
        "<%@ Page Language=\"C#\" AutoEventWireup=\"true\" CodeBehind=\"Default.aspx.cs\" Inherits=\"Portal.Pages.Default\" %>",
        "<form id=\"serverForm\" runat=\"server\">",
        "  <asp:HiddenField ID=\"PaymentsEnabledHidden\" runat=\"server\" />",
        "</form>",
        "<form id=\"paymentForm\"><p id='paymentStatus'></p></form>"
      ].join("\n"),
      "utf8"
    );

    const analysis = await aspNetMarkupAdapter.analyze({
      absolutePath: markupPath,
      workspaceRoot
    });

    expect(analysis?.symbols.map((symbol) => symbol.name)).toEqual([
      "paymentForm",
      "PaymentsEnabledHidden",
      "paymentStatus",
      "serverForm"
    ]);
  });

  /** Writes the files given, and returns the workspace's file index: those files and the others named. */
  async function workspace(files: Record<string, string>, others: string[] = []): Promise<Set<string>> {
    for (const [relative, content] of Object.entries(files)) {
      await fs.mkdir(path.dirname(path.join(workspaceRoot, relative)), { recursive: true });
      await fs.writeFile(path.join(workspaceRoot, relative), content, "utf8");
    }
    return new Set([...Object.keys(files), ...others]);
  }

  async function linksOf(relative: string, fileIndex: Set<string>): Promise<Array<string | undefined>> {
    const analysis = await aspNetMarkupAdapter.analyze({ absolutePath: path.join(workspaceRoot, relative), workspaceRoot, fileIndex });
    return (analysis?.dependencies ?? []).map((entry) => entry.resolvedPath ?? `unresolved ${entry.specifier}`);
  }

  const webProject = "<Project><PropertyGroup><ProjectTypeGuids>{349C5851-65DF-11DA-9384-00065B846F21};{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}</ProjectTypeGuids></PropertyGroup></Project>";

  it("reads every directive that names a file: a user control's code-behind, its registered controls, a page's master page", async () => {
    const fileIndex = await workspace({
      "Site/Site.csproj": webProject,
      "Site/Controls/Card.ascx": [
        "<%@ Control Language=\"C#\" AutoEventWireup=\"true\" CodeBehind=\"Card.ascx.cs\" Inherits=\"Site.Controls.Card\" %>",
        "<%@ Register TagPrefix=\"site\" TagName=\"Label\" Src=\"~/Controls/Label.ascx\" %>",
        "<%@ Register TagPrefix=\"site\" TagName=\"Badge\" Src=\"Badge.ascx\" %>",
        "<%-- <%@ Register TagPrefix=\"old\" TagName=\"Gone\" Src=\"~/Controls/Gone.ascx\" %> --%>",
        "<%@ Register TagPrefix=\"asp\" Namespace=\"System.Web.UI\" Assembly=\"System.Web\" %>"
      ].join("\n"),
      "Site/Default.aspx": "<%@ Page Title=\"Home\" MasterPageFile=\"~/Site.Master\" CodeBehind=\"Default.aspx.cs\" Inherits=\"Site.Default\" %>"
    }, ["Site/Controls/Card.ascx.cs", "Site/Controls/Label.ascx", "Site/Controls/Badge.ascx", "Site/Controls/Gone.ascx", "Site/Site.Master", "Site/Default.aspx.cs"]);

    expect(await linksOf("Site/Controls/Card.ascx", fileIndex)).toEqual(["Site/Controls/Card.ascx.cs", "Site/Controls/Label.ascx", "Site/Controls/Badge.ascx"]);
    expect(await linksOf("Site/Default.aspx", fileIndex)).toEqual(["Site/Default.aspx.cs", "Site/Site.Master"]);
  });

  it("reads master pages, handlers, web services, the application file and WCF service files, and a directive whose name is left out", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Web/Site.Master": "<%@ Master Language=\"C#\" CodeBehind=\"Site.Master.cs\" Inherits=\"Web.SiteMaster\" %>",
      "Web/Upload.ashx": "<%@ WebHandler Language=\"C#\" CodeBehind=\"Upload.ashx.cs\" Class=\"Web.Upload\" %>",
      "Web/Lookup.asmx": "<%@ WebService Language=\"C#\" CodeBehind=\"~/App_Code/Lookup.cs\" Class=\"Web.Lookup\" %>",
      "Web/Global.asax": "<%@ Application Codebehind=\"Global.asax.cs\" Inherits=\"Web.Global\" Language=\"C#\" %>",
      "Web/Pricing.svc": "<%@ ServiceHost Language=\"C#\" Debug=\"true\" Service=\"Web.Pricing\" CodeBehind=\"Pricing.svc.cs\" %>",
      "Web/Bare.aspx": "<%@ Language=\"C#\" CodeBehind='Bare.aspx.cs' %>"
    }, ["Web/Site.Master.cs", "Web/Upload.ashx.cs", "Web/App_Code/Lookup.cs", "Web/Global.asax.cs", "Web/Pricing.svc.cs", "Web/Bare.aspx.cs"]);

    expect(await linksOf("Web/Site.Master", fileIndex)).toEqual(["Web/Site.Master.cs"]);
    expect(await linksOf("Web/Upload.ashx", fileIndex)).toEqual(["Web/Upload.ashx.cs"]);
    expect(await linksOf("Web/Lookup.asmx", fileIndex)).toEqual(["Web/App_Code/Lookup.cs"]);
    expect(await linksOf("Web/Global.asax", fileIndex)).toEqual(["Web/Global.asax.cs"]);
    expect(await linksOf("Web/Pricing.svc", fileIndex)).toEqual(["Web/Pricing.svc.cs"]);
    expect(await linksOf("Web/Bare.aspx", fileIndex)).toEqual(["Web/Bare.aspx.cs"]);
    expect(aspNetMarkupAdapter.extensions).toEqual(expect.arrayContaining([".ascx", ".master", ".ashx", ".asmx", ".asax", ".svc"]));
  });

  it("reads `~/` from a deployed project as the one web application that holds the file, and links nothing where several or none do", async () => {
    const fileIndex = await workspace({
      "Website/Website.csproj": webProject,
      "Shop/Shop.csproj": webProject,
      "Providers/Editor/Editor.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>",
      "Providers/Editor/Options.ascx": [
        "<%@ Control CodeBehind=\"Options.ascx.cs\" %>",
        "<%@ Register TagPrefix=\"dnn\" TagName=\"Label\" Src=\"~/controls/LabelControl.ascx\" %>",
        "<%@ Register TagPrefix=\"dnn\" TagName=\"Menu\" Src=\"~/controls/Menu.ascx\" %>",
        "<%@ Register TagPrefix=\"dnn\" TagName=\"Ddr\" Src=\"~/DesktopModules/DDRMenu/Menu.ascx\" %>",
        "<%@ Register TagPrefix=\"dnn\" TagName=\"Rooted\" Src=\"/controls/LabelControl.ascx\" %>"
      ].join("\n")
    }, ["Providers/Editor/Options.ascx.cs", "Website/controls/LabelControl.ascx", "Website/controls/Menu.ascx", "Shop/controls/Menu.ascx"]);

    expect(await linksOf("Providers/Editor/Options.ascx", fileIndex)).toEqual([
      "Providers/Editor/Options.ascx.cs",
      "Website/controls/LabelControl.ascx",
      "unresolved ~/controls/Menu.ascx",
      "unresolved ~/DesktopModules/DDRMenu/Menu.ascx",
      "unresolved /controls/LabelControl.ascx"
    ]);
  });

  it("finds a file named in another case, as Windows does, links it in its own spelling, and links neither of two that differ by case alone", async () => {
    // The index stands for a Windows checkout: these paths are never asked of the disk, which on Linux tells case apart.
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Web/default.aspx": "<%@ Page CodeBehind=\"Default.aspx.cs\" MasterPageFile=\"~/site.master\" %>",
      "Web/Twins.aspx": "<%@ Page CodeBehind=\"Twins.aspx.cs\" %>"
    }, ["Web/default.aspx.CS", "Web/Site.Master", "Web/twins.aspx.cs", "Web/TWINS.aspx.cs"]);

    expect(await linksOf("Web/default.aspx", fileIndex)).toEqual(["Web/default.aspx.CS", "Web/Site.Master"]);
    expect(await linksOf("Web/Twins.aspx", fileIndex)).toEqual(["unresolved Twins.aspx.cs"]);
  });
});
