// Root's look at the 3D starting picture of this repository: serve dist/explorer, open 3D with nothing asked, wait, picture.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(process.argv[2] + '/package.json');
const { chromium } = require('@playwright/test');
const root = path.join(process.argv[2], 'dist/explorer');
const out = process.argv[3];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  let file = path.join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(root) || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ args: ['--use-angle=default', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://127.0.0.1:${server.address().port}/?view=local&mode=3d`, { waitUntil: 'load' });
await page.waitForTimeout(20000);
await page.screenshot({ path: out });
await browser.close();
server.close();
console.log('wrote', out);
