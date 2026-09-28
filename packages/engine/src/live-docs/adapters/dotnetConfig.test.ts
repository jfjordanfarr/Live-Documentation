import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { WorkspaceSymbolIndex } from "../coreTypes";
import { dotnetConfigAdapter } from "./dotnetConfig";

describe("dotnetConfigAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "dotnet-config-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  const HUB_CONFIG = [
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
  ].join("\n");

  it("publishes settings, connection strings, services, listening addresses and client endpoints, and links contracts and services to their types", async () => {
    await fs.mkdir(path.join(workspaceRoot, "Hub"), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, "Hub", "IPaymentHub.cs"), "namespace Estate.Contracts { public interface IPaymentHub { } }\n", "utf8");
    await fs.writeFile(path.join(workspaceRoot, "Hub", "PaymentHub.cs"),  "namespace Estate.Hub { public class PaymentHub : Estate.Contracts.IPaymentHub { } }\n", "utf8");
    const configPath = path.join(workspaceRoot, "Hub", "App.config");
    await fs.writeFile(configPath, HUB_CONFIG, "utf8");

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot });

    expect(result?.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual([
      "setting Hub.Workload",
      "connection-string PaymentsDb",
      "service Estate.Hub.PaymentHub",
      "address net.tcp://hub:8731/PaymentHub",
      "endpoint PaymentService.Consumer.Production"
    ]);
    expect(result?.dependencies).toEqual([
      { specifier: "Hub/IPaymentHub.cs", resolvedPath: "Hub/IPaymentHub.cs", symbols: ["IPaymentHub"], kind: "import" },
      { specifier: "Hub/PaymentHub.cs",  resolvedPath: "Hub/PaymentHub.cs",  symbols: ["PaymentHub"],  kind: "import" },
      { specifier: "net.tcp://payments:8732/PaymentService", symbols: [], kind: "import", basis: "configuration" }
    ]);
  });

  it("links a client endpoint to the configuration that listens on its address, observed from configuration", async () => {
    await fs.mkdir(path.join(workspaceRoot, "Hub"), { recursive: true });
    const configPath = path.join(workspaceRoot, "Hub", "App.config");
    await fs.writeFile(configPath, HUB_CONFIG, "utf8");
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["net.tcp://payments:8732/PaymentService", [
        { liveDocPath: "d/PaymentService/App.config.md", sourcePath: "PaymentService/App.config", anchor: "symbol-nettcppayments8732paymentservice", kind: "address" }
      ]]
    ]);

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot, symbolIndex });

    expect(result?.dependencies).toEqual([
      { specifier: "PaymentService/App.config", resolvedPath: "PaymentService/App.config", symbols: ["net.tcp://payments:8732/PaymentService"], kind: "import", basis: "configuration" }
    ]);
  });

  it("joins a relative service address to the host's base address", async () => {
    const configPath = path.join(workspaceRoot, "App.config");
    await fs.writeFile(configPath, [
      "<configuration><system.serviceModel><services>",
      "  <service name=\"Estate.Hub.PaymentHub\">",
      "    <host><baseAddresses><add baseAddress=\"net.tcp://hub:8731/\" /></baseAddresses></host>",
      "    <endpoint address=\"PaymentHub\" binding=\"netTcpBinding\" contract=\"IPaymentHub\" />",
      "    <endpoint address=\"\" binding=\"mexTcpBinding\" contract=\"IMetadataExchange\" />",
      "  </service>",
      "</services></system.serviceModel></configuration>"
    ].join("\n"), "utf8");

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot });

    expect(result?.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual([
      "service Estate.Hub.PaymentHub",
      "address net.tcp://hub:8731/PaymentHub",
      "address net.tcp://hub:8731"
    ]);
  });

  it("reads single-quoted attribute values, which XML allows", async () => {
    const configPath = path.join(workspaceRoot, "Web.config");
    await fs.writeFile(configPath, "<configuration><appSettings><add key='ClientConfig' value='{ \"refreshInterval\": 5000 }' /></appSettings></configuration>\n", "utf8");

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot });

    expect(result?.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual(["setting ClientConfig"]);
  });

  it("lists the packages a packages.config names as external dependencies", async () => {
    const configPath = path.join(workspaceRoot, "packages.config");
    await fs.writeFile(configPath, "<packages><package id=\"EntityFramework\" version=\"6.5.1\" /><package id=\"Newtonsoft.Json\" /></packages>\n", "utf8");

    const result = await dotnetConfigAdapter.analyze({ absolutePath: configPath, workspaceRoot });

    expect(result).toEqual({ symbols: [], dependencies: [
      { specifier: "EntityFramework@6.5.1", symbols: [], kind: "import" },
      { specifier: "Newtonsoft.Json",       symbols: [], kind: "import" }
    ] });
  });
});
