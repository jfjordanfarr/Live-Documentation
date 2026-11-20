// Which renderer a headless Chromium draws WebGL with, launched exactly as the suite launches it
// (`tests/e2e/browser-launch.ts`). Run from the repository's root:
//
//   npx tsx --tsconfig tsconfig.base.json <this file> [--executable <path to a browser>] [--channel <name>] [-- <extra args>]
//
// `--executable` runs another browser build under the same Playwright, to tell a change of browser from a change of
// machine; extra arguments after `--` are added to the suite's own, to try one change at a time. With
// `DEBUG=pw:browser` in the environment and `--enable-logging=stderr` among the extra arguments, the browser's own log
// is printed too.
import { chromium } from "@playwright/test";

import { browserLaunchOptions } from "../../../../../../../tests/e2e/browser-launch";

const argv = process.argv.slice(2);
const dash = argv.indexOf("--");
const own = dash >= 0 ? argv.slice(0, dash) : argv;
const extra = dash >= 0 ? argv.slice(dash + 1) : [];
const value = (name: string) => { const at = own.indexOf(`--${name}`); return at >= 0 ? own[at + 1] : undefined; };

async function main(): Promise<void> {
  const options = browserLaunchOptions();
  const args = [...(options.args ?? []), ...extra];
  const browser = await chromium.launch({
    ...options,
    args,
    ...(value("executable") ? { executablePath: value("executable") } : {}),
    ...(value("channel") ? { channel: value("channel") } : {})
  });
  try {
    const page = await browser.newPage();
    const renderer = await page.evaluate(() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return null;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      return String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    });
    console.log(`browser ${browser.version()}; args ${JSON.stringify(args)}`);
    console.log(`WebGL renderer: ${renderer}`);
  } finally {
    await browser.close();
  }
}

void main();
