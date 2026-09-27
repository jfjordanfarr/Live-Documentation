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
      workspaceRoot
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
});
