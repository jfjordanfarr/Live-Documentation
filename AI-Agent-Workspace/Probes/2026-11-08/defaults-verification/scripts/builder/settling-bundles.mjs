import { build } from "esbuild";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const out = "/tmp/live-docs-20261108-defaults-diagnostics";
await mkdir(out, { recursive: true });
for (const [name, root] of [["candidate", "/tmp/live-docs-20261108-defaults"], ["base", "/tmp/live-docs-20261108-defaults-control"]]) {
  await build({
    entryPoints: [path.join(root, "packages/explorer/src/client/index.ts")],
    outfile: path.join(out, `${name}.js`), bundle: true, format: "esm", sourcemap: true,
    minify: true, target: "es2022", logLevel: "silent", loader: { ".ts": "ts" },
    plugins: [{ name: "read-only-settling-state", setup(builder) {
      builder.onLoad({ filter: /forceGraphView\.ts$/ }, async args => {
        const text = await readFile(args.path, "utf8");
        const marker = "  return { render, setActive, focusNode, focusDirectory";
        if (!text.includes(marker)) throw new Error(`Missing diagnostic seam in ${args.path}`);
        const getter = `  (window as unknown as { forceDiagnostic: () => unknown }).forceDiagnostic = () => ({
          simulationRunning, motionStill: motion?.still, revision: motion?.revision, ready,
          packing: [...packing.keys()], bodies: bodies.size,
          reveal: { shown: reveal.shown, total: reveal.order.length },
          drawn: forceGraphInstance?.graphData().nodes.length,
          wrapped: wrapped.size, cells: cells.size, hoveredId, pointerHoverId, focusedId, attentionSettings,
          root: { hop: scopeHops.get('directory:'), frontier: atFrontier('directory:'), cell: cells.has('directory:'), lone: loneNames.has('directory:'), shell: shells.has('directory:') },
          orphan: { hop: scopeHops.get('Estate.sln'), frontier: atFrontier('Estate.sln'), cell: cells.has('Estate.sln'), lone: loneNames.has('Estate.sln'), shell: shells.has('Estate.sln'), released: released.has('Estate.sln') }
        });\n`;
        return { contents: text.replace(marker, getter + marker), loader: "ts", resolveDir: path.dirname(args.path) };
      });
    } }]
  });
  console.log(`Built ${name} diagnostic renderer`);
}
