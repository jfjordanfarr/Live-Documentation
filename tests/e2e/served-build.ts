import type { FullConfig } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * That the browser suite runs against this checkout's build and no other. On 2026-11-19, with several builders sharing
 * one machine, Playwright's reuse of whatever answered on its port could have handed one builder's run another's
 * server, and nothing would have said so. So the suite starts its own server on a port found free, refuses a port
 * that already answers unless reuse is asked for by name, and at its start proves that the server answering serves
 * this checkout's `dist/explorer` and that the bundles there were built together from the client as it stands.
 */

/** Names a port for the suite's server; unset, the suite finds a free one. */
export const PORT_VARIABLE = "LIVE_DOCS_E2E_PORT";
/** "1" lets the suite use a server already answering on the named port, once it has proved that server serves this build. */
export const REUSE_VARIABLE = "LIVE_DOCS_E2E_REUSE";
/** The port this run's main process chose, handed to the processes Playwright starts, which read the configuration again. */
const DECIDED_VARIABLE = "LIVE_DOCS_E2E_DECIDED_PORT";

/** What the machine says of ports. */
export interface PortProbes {
  /** Whether something accepts a connection on the port at this host. */
  answers(port: number): boolean;
  /** A port nothing listens on now. */
  freePort(): number;
}

/** The port the suite's server takes, and whether a server already there may be used. */
export interface ServerPort {
  port: number;
  reuse: boolean;
}

/**
 * The port for this run, or a plain refusal. A run's own processes take the port its main process chose; a named port
 * that already answers is refused unless reuse is asked for; with no port named, a free one.
 */
export function decidePort(env: NodeJS.ProcessEnv, probes: PortProbes): ServerPort {
  const reuse = env[REUSE_VARIABLE] === "1";
  const decided = env[DECIDED_VARIABLE];
  if (decided) return { port: Number(decided), reuse };
  const asked = env[PORT_VARIABLE];
  if (!asked) {
    if (reuse) throw new Error(`${REUSE_VARIABLE}=1 reuses the server on the port ${PORT_VARIABLE} names, and it names none.`);
    return { port: probes.freePort(), reuse: false };
  }
  const port = Number(asked);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error(`${PORT_VARIABLE}=${asked} is not a port.`);
  if (!reuse && probes.answers(port)) {
    throw new Error(
      `Port ${port} (${PORT_VARIABLE}) already answers, and the browser suite will not test a server it did not start: `
      + `it may be serving another checkout's build. Stop what listens there, leave ${PORT_VARIABLE} unset so that the suite `
      + `finds a free port, or set ${REUSE_VARIABLE}=1 to use that server once the suite has proved it serves this build.`
    );
  }
  return { port, reuse };
}

const child = (script: string, args: string[] = []) => spawnSync(process.execPath, ["-e", script, ...args], { encoding: "utf8", timeout: 10_000 });

/** The machine's answers, each from a short-lived Node process, since a configuration is read synchronously. */
export const machinePorts: PortProbes = {
  answers(port) {
    const probe = child(
      "const net=require('node:net');let open=0;const hosts=['127.0.0.1','::1'];let left=hosts.length;"
      + "for(const host of hosts){const s=net.connect({host,port:Number(process.argv[1])});s.setTimeout(1000);"
      + "const done=ok=>{open||=ok;s.destroy();if(--left===0)process.exit(open?0:1)};"
      + "s.once('connect',()=>done(1));s.once('error',()=>done(0));s.once('timeout',()=>done(0))}",
      [String(port)]
    );
    return probe.status === 0;
  },
  freePort() {
    const probe = child("const s=require('node:net').createServer();s.listen(0,'127.0.0.1',()=>{process.stdout.write(String(s.address().port));s.close()})");
    const port = Number(probe.stdout);
    if (probe.status !== 0 || !Number.isInteger(port) || port <= 0) throw new Error(`No free port could be found: ${probe.stderr || probe.error?.message}`);
    return port;
  }
};

/** Decides this run's port once, in Playwright's main process, and hands it to the processes it starts. */
export function serverPortForThisRun(env: NodeJS.ProcessEnv = process.env): ServerPort {
  const server = decidePort(env, machinePorts);
  env[DECIDED_VARIABLE] = String(server.port);
  return server;
}

/**
 * Proves that the server at `baseURL` serves `site` itself: a file of a fresh name and content is written into the
 * folder, fetched through the server, and removed. A server serving any other folder, another checkout's above all,
 * cannot answer with it.
 */
export async function proveServedFolder(site: string, baseURL: string): Promise<void> {
  const name = `e2e-served-build-${randomBytes(8).toString("hex")}.txt`;
  const content = randomBytes(16).toString("hex");
  const file = path.join(site, name);
  fs.writeFileSync(file, content);
  let answer: string;
  try {
    const response = await fetch(new URL(name, baseURL));
    answer = response.ok ? await response.text() : `status ${response.status}`;
  } catch (error) {
    answer = `no answer (${error instanceof Error ? error.message : String(error)})`;
  } finally {
    fs.rmSync(file, { force: true });
  }
  if (answer !== content) {
    throw new Error(
      `The server at ${baseURL} does not serve this checkout's ${site}: asked for a file just written there, it gave ${answer}. `
      + `Stop that server, or leave ${PORT_VARIABLE} unset so that the suite starts its own on a free port.`
    );
  }
}

/** The folder the suite's server serves. */
const SITE = path.resolve(__dirname, "../../dist/explorer");

/**
 * Refuses bundles that were not built together from the client as it stands. The list of bundles and the check are
 * `scripts/e2e-bundles.mjs`'s, run as its own Node process, since Playwright's loader would compile that module to
 * CommonJS, which an ES module cannot be.
 */
function refuseStaleBundles(): void {
  const checked = spawnSync(process.execPath, [path.resolve(__dirname, "../../scripts/e2e-bundles.mjs"), "--check"], { encoding: "utf8" });
  if (checked.status !== 0) throw new Error(checked.stderr.trim() || `The bundles' check could not run: ${checked.error?.message ?? `exit ${checked.status}`}`);
}

/** The suite's first global setup: the bundles were built together and are current, and the server serves them. */
export default async function checkServedBuild(config: FullConfig): Promise<void> {
  refuseStaleBundles();
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) throw new Error("The browser suite's configuration names no baseURL.");
  await proveServedFolder(SITE, baseURL);
  console.log(`The server at ${baseURL} serves this checkout's dist/explorer, and its bundles were built together.`);
}
