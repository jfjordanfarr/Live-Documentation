import { chromium } from "@playwright/test";

import { asksForCard, browserLaunchOptions, CARD_RENDERER, RENDERER_VARIABLE } from "./browser-launch";

/**
 * Says at the head of every run of the browser suite what draws its WebGL pictures, and stops the run where the
 * graphics card was asked for and did not answer.
 *
 * A browser that misses the card does not say so: it draws in software, a tenth as fast, and the cases that wait on
 * this repository's own 3D picture then fail on their clocks as if the product had slowed. The line this prints is
 * what a reader of a gate's log needs before reading any of those times.
 */
export default async function reportRenderer(): Promise<void> {
  const options = browserLaunchOptions();
  const browser = await chromium.launch(options);
  let renderer: string | null;
  try {
    const page = await browser.newPage();
    renderer = await page.evaluate(() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return null;
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      return String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    });
  } finally {
    await browser.close();
  }
  console.log(`WebGL in this run is drawn by: ${renderer ?? "nothing (no WebGL context could be created)"}`);
  if (asksForCard(options) && !CARD_RENDERER.test(renderer ?? "")) {
    throw new Error(
      "The container has a graphics card (/dev/dxg) but the browser is not drawing on it. "
      + `Mend the card's path (see .devcontainer/README.md), or set ${RENDERER_VARIABLE}=software to run this suite on the processor.`
    );
  }
}
