import type { LaunchOptions } from "@playwright/test";
import { existsSync } from "node:fs";

/** WSL2's door to the Windows graphics driver, as a container sees it when the host passed the door in. */
const CARD_DEVICE = "/dev/dxg";

/** Where WSL2 keeps Microsoft's Direct3D 12 libraries for Linux, which Mesa's `d3d12` driver loads by name. */
const CARD_LIBRARIES = "/usr/lib/wsl/lib";

/** Set to `software` to launch as Playwright does by default, drawing on the processor, where a card is present. */
export const RENDERER_VARIABLE = "LIVE_DOCS_BROWSER_RENDERER";

/** What a page's WebGL renderer string says when the card draws it: Mesa's name for OpenGL carried by Direct3D 12. */
export const CARD_RENDERER = /D3D12/;

/**
 * How this repository launches a headless Chromium of its own, for the browser suite and the contact sheet: on the
 * host's graphics card where the container was given one, and exactly as Playwright launches it everywhere else.
 *
 * Left alone, a headless Chromium draws WebGL in software (SwiftShader), which gives this repository's own 3D picture
 * about four frames a second and most of the machine's threads. Under WSL2 the card is reached through Direct3D 12:
 * Chromium's WebGL layer (ANGLE) is told to draw through the system's EGL, which is Mesa, and Mesa is told to use its
 * `d3d12` driver and where that driver's libraries are. The three settings go together or not at all: with the flag
 * and without the driver, Chromium either falls back to software without a word or cannot create WebGL at all
 * (measured 2026-11-17; the numbers are in this file's Live Doc).
 *
 * The card draws WebGL and nothing else: `--disable-gpu-compositing` leaves the page itself, the 2D map's SVG among
 * it, to be put together on the processor as in a browser without a card. Through this path the card was the slower
 * of the two for a large 2D picture (its first frame in 7.1 s against 4.5), and the browser found so little idle time
 * beside it that the 2D map's continuing search, which runs in the page's idle moments, took 74 s where it takes 61
 * in software, which three browser cases could not wait out. With compositing on the processor the search takes
 * 56 s and the 3D picture still draws at 49 frames a second, against 51 with everything on the card.
 */
export function browserLaunchOptions(
  environment: NodeJS.ProcessEnv = process.env,
  exists: (path: string) => boolean = existsSync
): LaunchOptions {
  if (environment[RENDERER_VARIABLE] === "software") return {};
  if (!exists(CARD_DEVICE) || !exists(`${CARD_LIBRARIES}/libd3d12.so`)) return {};
  const inherited = Object.fromEntries(Object.entries(environment).filter((entry): entry is [string, string] => entry[1] !== undefined));
  return {
    args: ["--use-angle=gl-egl", "--disable-gpu-compositing"],
    env: {
      ...inherited,
      GALLIUM_DRIVER: "d3d12",
      LD_LIBRARY_PATH: [CARD_LIBRARIES, environment.LD_LIBRARY_PATH].filter(Boolean).join(":")
    }
  };
}

/** True where `browserLaunchOptions` asked for the card, so that a caller can check that the card answered. */
export function asksForCard(options: LaunchOptions): boolean {
  return options.env?.GALLIUM_DRIVER === "d3d12";
}
