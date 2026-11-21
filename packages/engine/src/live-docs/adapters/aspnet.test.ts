import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { aspNetMarkupAdapter, resolveDirectivePath, withoutMarkupComments } from "./aspnet";

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
        "<script src=\"~/js/blazor-telemetry.js\"></script>"
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
    // `~/` is the web root of the markup's project (`resolveDirectivePath`), an ASP.NET Core one with a `wwwroot`, as a Blazor app is.
    await fs.writeFile(path.join(workspaceRoot, "BlazorTelemetry.csproj"), "<Project Sdk=\"Microsoft.NET.Sdk.Web\"></Project>", "utf8");

    const analysis = await aspNetMarkupAdapter.analyze({
      absolutePath: markupPath,
      workspaceRoot,
      fileIndex: new Set(["BlazorTelemetry.csproj", "Pages/_Host.razor", "Pages/_Host.razor.cs", "wwwroot/js/blazor-telemetry.js"])
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

  it("says why a directive's path has no link: several projects hold it, no file does, two differ by case alone, or it starts at the site's root", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Features/Features.csproj": webProject
    }, ["Features/Page.aspx", "Web/App_MasterPages/layout.Master", "Features/App_MasterPages/layout.Master", "Features/twin.ascx", "Features/TWIN.ascx"]);
    const reason = async (written: string) => {
      const resolved = await resolveDirectivePath(written, "Features/Page.aspx", workspaceRoot, fileIndex);
      return "reason" in resolved ? resolved.reason : resolved.file;
    };

    expect(await reason("~/App_MasterPages/layout.Master")).toBe("paths several projects hold, left unlinked");
    expect(await reason("~/App_MasterPages/Missing.Master")).toBe("paths no file in the workspace holds, left unlinked");
    expect(await reason("Missing.ascx")).toBe("paths no file in the workspace holds, left unlinked");
    expect(await reason("Twin.ascx")).toBe("paths two files match without regard to case, left unlinked");
    expect(await reason("/App_MasterPages/layout.Master")).toBe("paths from the site's root, left unlinked");
  });

  it("links `~/` to the page's own project only when no other web project holds the same path, since a stub kept for compiling is not what the host serves", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Features/Features.csproj": webProject,
      "Features/Blog/EditPost.aspx": [
        "<%@ Page MasterPageFile=\"~/App_MasterPages/layout.Master\" CodeBehind=\"EditPost.aspx.cs\" %>",
        "<%@ Register TagPrefix=\"blog\" TagName=\"List\" Src=\"~/Blog/Controls/PostList.ascx\" %>",
        "<%@ Register TagPrefix=\"site\" TagName=\"Login\" Src=\"~/Controls/Login.ascx\" %>"
      ].join("\n")
    }, ["Features/Blog/EditPost.aspx.cs", "Features/App_MasterPages/layout.Master", "Web/App_MasterPages/layout.Master", "Features/Blog/Controls/PostList.ascx", "Web/Controls/Login.ascx"]);

    expect(await linksOf("Features/Blog/EditPost.aspx", fileIndex)).toEqual([
      "Features/Blog/EditPost.aspx.cs",
      "unresolved ~/App_MasterPages/layout.Master",
      "Features/Blog/Controls/PostList.ascx",
      "Web/Controls/Login.ascx"
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

  it("hands the reasons a directive's path has no link to the run as notices, each subject the path as written, since the run names the file", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Features/Features.csproj": webProject,
      "Features/Page.aspx": "<%@ Page MasterPageFile=\"~/App_MasterPages/layout.Master\" CodeBehind=\"Page.aspx.cs\" %>\n<%@ Register TagPrefix=\"x\" TagName=\"Gone\" Src=\"Gone.ascx\" %>"
    }, ["Features/Page.aspx.cs", "Web/App_MasterPages/layout.Master", "Features/App_MasterPages/layout.Master"]);
    const analysis = await aspNetMarkupAdapter.analyze({ absolutePath: path.join(workspaceRoot, "Features/Page.aspx"), workspaceRoot, fileIndex });
    expect(analysis?.notices).toEqual([
      { reason: "paths several projects hold, left unlinked", subject: "~/App_MasterPages/layout.Master" },
      { reason: "paths no file in the workspace holds, left unlinked", subject: "Gone.ascx" }
    ]);
  });

  // The shapes are mojoPortal's `_Layout.cshtml` and `layout.Master` and DNN's `UpgradeWizard.aspx`, measured on 2026-11-21.
  it("reads a script's path by the directives' rule, its query taken off, says why one has no link, and reads no remote address or computed path", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Web/Views/Shared/_Layout.cshtml": [
        "<script src=\"~/Scripts/bootstrap.min.js\"></script>",
        "<script src=\"~/Scripts/modernizr\"></script>",
        "<script src=\"~/Scripts/jquery-1.10.2.min.js\"></script>",
        "<script src=\"/Content/js/main.min.js\"></script>",
        "<script src=\"//cdn.example.org/a.js\"></script>",
        "<script src=\"https://cdn.example.org/b.js\"></script>",
        "<script src=\"@(siteRoot + folderName)gallery/c.js\"></script>"
      ].join("\n"),
      "Web/Install/Wizard.aspx": [
        "<%@ Page CodeBehind=\"Wizard.aspx.cs\" %>",
        "<script src=\"../Scripts/dnn.js?ver=<%=Globals.FormatVersion(ApplicationVersion)%>\"></script>",
        "<script src=\"<%= ResolveUrl(\"~/Scripts/app.js\") %>\"></script>"
      ].join("\n")
    }, ["Web/Scripts/bootstrap.min.js", "Web/Scripts/modernizr.js", "Web/Scripts/dnn.js", "Web/Scripts/app.js", "Web/Install/Wizard.aspx.cs", "Content/js/main.min.js"]);

    expect(await linksOf("Web/Views/Shared/_Layout.cshtml", fileIndex)).toEqual([
      "Web/Scripts/bootstrap.min.js",
      "Web/Scripts/modernizr.js",
      "unresolved ~/Scripts/jquery-1.10.2.min.js",
      "unresolved /Content/js/main.min.js"
    ]);
    const layout = await aspNetMarkupAdapter.analyze({ absolutePath: path.join(workspaceRoot, "Web/Views/Shared/_Layout.cshtml"), workspaceRoot, fileIndex });
    expect(layout?.notices).toEqual([
      { reason: "paths no file in the workspace holds, left unlinked", subject: "~/Scripts/jquery-1.10.2.min.js" },
      { reason: "paths from the site's root, left unlinked", subject: "/Content/js/main.min.js" }
    ]);
    expect(await linksOf("Web/Install/Wizard.aspx", fileIndex)).toEqual(["Web/Scripts/dnn.js", "Web/Install/Wizard.aspx.cs"]);
  });

  // Microsoft's "Static files in ASP.NET Core": an app serves its web root, `wwwroot` by default, and `~/` in a Razor
  // view names it. The shapes are eShopOnWeb's `_Layout.cshtml` and a nopCommerce plugin's view, measured on 2026-11-21.
  const coreProject = "<Project Sdk=\"Microsoft.NET.Sdk.Web\"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>";
  it("reads an ASP.NET Core view's `~/` and `/` from its project's web root, and a module's `~/` from the web root of the app that hosts it", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": coreProject,
      "Web/Views/Shared/_Layout.cshtml": [
        "<script src=\"~/js/site.js\"></script>",
        "<script src=\"~/lib/jquery/dist/jquery.min.js\"></script>",
        "<script src=\"/js/site.js\"></script>",
        "<script src=\"~/js/missing.js\"></script>",
        "<script src=\"~/lib/summernote/lang/summernote-@(language).min.js\"></script>"
      ].join("\n"),
      "Api/Api.csproj": coreProject,
      "Plugins/Forums/Forums.csproj": "<Project Sdk=\"Microsoft.NET.Sdk\"></Project>",
      "Plugins/Forums/Views/Editor.cshtml": "<script src=\"~/lib/jquery/dist/jquery.min.js\"></script>"
    }, ["Web/wwwroot/js/site.js", "Web/wwwroot/lib/jquery/dist/jquery.min.js", "Api/wwwroot/js/site.js", "Web/js/site.js"]);

    expect(await linksOf("Web/Views/Shared/_Layout.cshtml", fileIndex)).toEqual([
      "Web/wwwroot/js/site.js",
      "Web/wwwroot/lib/jquery/dist/jquery.min.js",
      "unresolved ~/js/missing.js"
    ]);
    expect(await linksOf("Plugins/Forums/Views/Editor.cshtml", fileIndex)).toEqual(["Web/wwwroot/lib/jquery/dist/jquery.min.js"]);
  });

  it("reads `~/` from an ASP.NET Core project's own folder when no `wwwroot` stands beside its project file, and a Web Forms project's as before", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": coreProject,
      "Web/Views/Home/Index.cshtml": "<script src=\"~/js/site.js\"></script>\n<script src=\"/js/site.js\"></script>"
    }, ["Web/js/site.js"]);

    expect(await linksOf("Web/Views/Home/Index.cshtml", fileIndex)).toEqual(["Web/js/site.js", "unresolved /js/site.js"]);
  });

  // ASP.NET removes `<%-- --%>` and Razor `@* *@` before anything is sent; no browser runs a script inside `<!-- -->`, and
  // since Internet Explorer 10 none reads a conditional comment's content. The downlevel-revealed form leaves its content
  // outside every comment, so a browser runs it.
  it("reads no script tag a server, Razor or HTML comment holds, and the one a downlevel-revealed conditional comment leaves outside", async () => {
    const fileIndex = await workspace({
      "Web/Web.csproj": webProject,
      "Web/Default.aspx": [
        "<%@ Page CodeBehind=\"Default.aspx.cs\" %>",
        "<%-- <script src=\"Scripts/server-commented.js\"></script> --%>",
        "<!-- <script src=\"Scripts/legacy.js\"></script> -->",
        "<!--[if lt IE 9]><script src=\"Scripts/html5shiv.js\"></script><![endif]-->",
        "<!--[if !IE]><!--><script src=\"Scripts/modern.js\"></script><!--<![endif]-->",
        "<script src=\"Scripts/live.js\"></script>"
      ].join("\n"),
      "Web/Views/Home/Index.cshtml": [
        "<!-- <script src=\"~/js/old.js\"></script> -->",
        "@* <script src=\"~/js/razor-commented.js\"></script> *@",
        "<script src=\"~/js/site.js\"></script>"
      ].join("\n")
    }, ["Web/Default.aspx.cs", "Web/Scripts/server-commented.js", "Web/Scripts/legacy.js", "Web/Scripts/html5shiv.js", "Web/Scripts/modern.js", "Web/Scripts/live.js",
      "Web/js/old.js", "Web/js/razor-commented.js", "Web/js/site.js"]);

    expect(await linksOf("Web/Default.aspx", fileIndex)).toEqual(["Web/Scripts/modern.js", "Web/Scripts/live.js", "Web/Default.aspx.cs"]);
    expect(await linksOf("Web/Views/Home/Index.cshtml", fileIndex)).toEqual(["Web/js/site.js"]);
  });

  it("writes comments over in spaces with their line breaks kept, and ends `<!-->` and `<!--->` at once, as HTML parses them", () => {
    const text = "a<!-- x\ny -->b<%-- z --%>c<!-->d<!--->e@* r *@f";
    const forms = withoutMarkupComments(text, false);
    expect(forms).toHaveLength(text.length);
    expect(forms).toBe(`a      \n     b${" ".repeat("<%-- z --%>".length)}c     d      e@* r *@f`);
    expect(withoutMarkupComments("@* r\n *@<%-- s --%>", true)).toBe("    \n   <%-- s --%>");
  });

  // Too many open files, a file Windows holds: no property of the project file, so never read as a project that builds nothing.
  it("throws a failure of the machine's in reading a project file for its kind, and reads one of the file's own as no web project", async () => {
    vi.resetModules();
    const failing = { error: undefined as Error | undefined };
    vi.doMock("../../tooling/sourceText", async (importOriginal) => {
      const actual = await importOriginal<typeof import("../../tooling/sourceText")>();
      return { ...actual, readSourceText: (file: string) => (failing.error !== undefined && file.endsWith("Web.csproj") ? Promise.reject(failing.error) : actual.readSourceText(file)) };
    });
    try {
      const { aspNetMarkupAdapter: own } = await vi.importActual<typeof import("./aspnet")>("./aspnet");
      const read = async () => {
        const fileIndex = await workspace({ "Web/Web.csproj": webProject, "Features/Features.csproj": webProject, "Features/Page.aspx": "<%@ Page MasterPageFile=\"~/Site.Master\" %>" }, ["Web/Site.Master"]);
        return own.analyze({ absolutePath: path.join(workspaceRoot, "Features/Page.aspx"), workspaceRoot, fileIndex });
      };
      // Read, `Web` is the one web project that holds the master page.
      expect((await read())?.dependencies.map((entry) => entry.resolvedPath ?? `unresolved ${entry.specifier}`)).toEqual(["Web/Site.Master"]);
      failing.error = Object.assign(new Error("EMFILE: too many open files, open 'Web.csproj'"), { code: "EMFILE", syscall: "open", errno: -24 });
      await expect(read()).rejects.toThrow("EMFILE: too many open files");
      // A project file whose bytes fail for a cause of their own says nothing of what it builds, so `Web` is no host here.
      failing.error = new Error("the project file's bytes could not be read");
      expect((await read())?.dependencies.map((entry) => entry.resolvedPath ?? `unresolved ${entry.specifier}`)).toEqual(["unresolved ~/Site.Master"]);
    } finally {
      vi.doUnmock("../../tooling/sourceText");
      vi.resetModules();
    }
  });
});
