import { build } from 'esbuild';
import { cp, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root = process.cwd();
const baseline = path.join(root, 'dist/explorer/samples/estate-baseline');
await cp(path.join(root, 'dist/explorer/samples/estate'), baseline, { recursive: true });
const oldView = execFileSync('git', ['show', 'HEAD:packages/explorer/src/client/views/forceGraphView.ts'], { cwd: root, encoding: 'utf8' });
await build({
  entryPoints: [path.join(root, 'packages/explorer/src/client/index.ts')],
  outfile: path.join(baseline, 'static/index.js'), bundle: true, format: 'esm', sourcemap: true,
  minify: true, target: 'es2022', logLevel: 'silent', loader: { '.ts': 'ts' },
  plugins: [{ name: 'original-whole-membership', setup(builder) {
    builder.onLoad({ filter: /forceGraphView\.ts$/ }, args => ({ contents: oldView, loader: 'ts', resolveDir: path.dirname(args.path) }));
  } }]
});
const original = await readFile(path.join(root, 'tests/e2e/force-graph-exploration.spec.ts'), 'utf8');
const imports = original.slice(0, original.indexOf('test("the visible hops'));
const tests = original.slice(original.indexOf('for (const groupWrappers of ["skin", "off"]'))
  .replace('["skin", "off"]', '["skin"]')
  .replaceAll('/samples/estate/', '/samples/estate-baseline/');
await (await import('node:fs/promises')).writeFile(path.join(root, 'tests/e2e/whole-baseline-check.spec.ts'), imports + tests);
