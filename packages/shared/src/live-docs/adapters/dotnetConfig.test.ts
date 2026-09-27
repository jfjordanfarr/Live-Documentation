import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { dotnetConfigAdapter } from "./dotnetConfig";

describe("dotnetConfigAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "dotnet-config-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes settings, connection strings, endpoints and services, and links contracts and services to their types", async () => {
    await fs.mkdir(path.join(workspaceRoot, "Hub"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "Hub", "IPaymentHub.cs"), "namespace Estate.Contracts { public interface IPaymentHub { } }\n", "utf8");
    await fs.writeFile(path.join(workspaceRoot, "Hub", "PaymentHub.cs"),  "namespace Estate.Hub { public class PaymentHub : Estate.Contracts.IPaymentHub { } }\n", "utf8");
    const configPath = path.join(workspaceRoot, "Hub", "App.config");
    await fs.writeFile(
      configPath,
      [
        "<?xml version=\"1.0\"?>",
        "<configuration>",
        "  <appSettings>",
        "    <add key=\"Hub.Workload\" value=\"Consumer\" />",
        "  </appSettings>",
        "  <connectionStrings>",
        "    <add name=\"PaymentsDb\" connectionString=\"Server=x\" providerName=\"System.Data.SqlClient\" />",
        "  </connectionStrings>",
        "  <system.serviceModel>",
        "    <services>",
        "      <service name=\"Estate.Hub.PaymentHub\">",
        "        <endpoint address=\"net.tcp://hub:8731/PaymentHub\" binding=\"netTcpBinding\" contract=\"Estate.Contracts.IPaymentHub\" />",
        "      </service>",
        "    </services>",
        "    <client>",
        "      <endpoint name=\"PaymentService.Consumer.Production\" address=\"net.tcp://payments:8732/PaymentService\" contract=\"Estate.Contracts.IPaymentService\" />",
        "    </client>",
        "  </system.serviceModel>",
        "</configuration>"
      ].join("\n"),
      "utf8"
    );

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot });

    expect(result?.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual([
      "setting Hub.Workload",
      "connection-string PaymentsDb",
      "service Estate.Hub.PaymentHub",
      "endpoint PaymentService.Consumer.Production"
    ]);
    expect(result?.dependencies).toEqual([
      { specifier: "Hub/IPaymentHub.cs", resolvedPath: "Hub/IPaymentHub.cs", symbols: ["IPaymentHub"], kind: "import" },
      { specifier: "Hub/PaymentHub.cs",  resolvedPath: "Hub/PaymentHub.cs",  symbols: ["PaymentHub"],  kind: "import" }
    ]);
  });

  it("publishes nothing for a configuration file without those elements", async () => {
    const configPath = path.join(workspaceRoot, "packages.config");
    await fs.writeFile(configPath, "<packages><package id=\"EntityFramework\" version=\"6.5.1\" /></packages>\n", "utf8");

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot });

    expect(result).toEqual({ symbols: [], dependencies: [] });
  });
});
