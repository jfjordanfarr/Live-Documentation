import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { decidePort, proveServedFolder, type PortProbes } from "./served-build";

/** That the browser suite's server is its own: the port it takes, and the proof that a server serves this build. */

describe("the port of the suite's server", () => {
  const probes = (answering: number[] = []): PortProbes => ({ answers: port => answering.includes(port), freePort: () => 40123 });

  it("is a free port when none is named", () => {
    expect(decidePort({}, probes())).toEqual({ port: 40123, reuse: false });
  });

  it("refuses a named port that already answers, plainly, unless reuse is asked for by name", () => {
    expect(() => decidePort({ LIVE_DOCS_E2E_PORT: "8830" }, probes([8830]))).toThrow(/Port 8830 \(LIVE_DOCS_E2E_PORT\) already answers/);
    expect(decidePort({ LIVE_DOCS_E2E_PORT: "8830" }, probes())).toEqual({ port: 8830, reuse: false });
    expect(decidePort({ LIVE_DOCS_E2E_PORT: "8830", LIVE_DOCS_E2E_REUSE: "1" }, probes([8830]))).toEqual({ port: 8830, reuse: true });
    expect(() => decidePort({ LIVE_DOCS_E2E_REUSE: "1" }, probes())).toThrow(/names none/);
  });

  it("is, in the processes a run starts, the port its main process chose, though its own server now answers there", () => {
    expect(decidePort({ LIVE_DOCS_E2E_DECIDED_PORT: "40999", LIVE_DOCS_E2E_PORT: "8830" }, probes([40999, 8830]))).toEqual({ port: 40999, reuse: false });
  });
});

describe("the proof that a server serves this build", () => {
  const folders: string[] = [];
  const servers: http.Server[] = [];
  afterEach(() => {
    servers.splice(0).forEach(server => server.close());
    folders.splice(0).forEach(folder => fs.rmSync(folder, { recursive: true, force: true }));
  });

  /** A folder, and a server of its files at a base URL. */
  async function served(): Promise<{ folder: string; baseURL: string }> {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), "served-build-"));
    folders.push(folder);
    const server = http.createServer((request, response) => {
      const file = path.join(folder, decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname));
      if (fs.existsSync(file)) response.end(fs.readFileSync(file));
      else response.writeHead(404).end();
    });
    servers.push(server);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    return { folder, baseURL: `http://127.0.0.1:${(server.address() as AddressInfo).port}/` };
  }

  it("holds for the folder the server serves, and leaves nothing behind in it", async () => {
    const { folder, baseURL } = await served();
    await proveServedFolder(folder, baseURL);
    expect(fs.readdirSync(folder)).toEqual([]);
  });

  it("refuses a server serving another checkout's folder", async () => {
    const mine = await served();
    const theirs = await served();
    await expect(proveServedFolder(mine.folder, theirs.baseURL)).rejects.toThrow(/does not serve this checkout's/);
    expect(fs.readdirSync(mine.folder)).toEqual([]);
  });
});
