// Serve dist/explorer on a port of its own and run the 2026-11-08 motion-frames script against it. Usage, from the
// repository's root: node <this folder>/frames.mjs <name> <out dir>, inside the browser lane.
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const [name, out] = process.argv.slice(2);
const require = createRequire(path.join(root, "package.json"));
const port = 8931;
const server = spawn(process.execPath, [require.resolve("http-server/bin/http-server"), path.join(root, "dist/explorer"), "-p", String(port), "-c-1", "--silent"], { stdio: "ignore" });
await new Promise(resolve => setTimeout(resolve, 1500));
const script = fileURLToPath(new URL("motion-frames.cjs", import.meta.url));
const run = spawnSync(path.join(root, "node_modules/.bin/tsx"), [script], { stdio: "inherit", env: { ...process.env, BASE: `http://127.0.0.1:${port}/`, NAME: name, OUT: out } });
server.kill();
process.exit(run.status ?? 1);
