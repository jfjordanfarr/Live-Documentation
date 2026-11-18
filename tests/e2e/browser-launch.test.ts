import { describe, expect, it } from "vitest";

import { asksForCard, browserLaunchOptions, RENDERER_VARIABLE } from "./browser-launch";

const DEVICE = "/dev/dxg";
const LIBRARY = "/usr/lib/wsl/lib/libd3d12.so";
const present = (...paths: string[]) => (path: string): boolean => paths.includes(path);

describe("browserLaunchOptions", () => {
  it("launches as Playwright does where no card was passed in", () => {
    expect(browserLaunchOptions({}, present())).toEqual({});
    expect(asksForCard(browserLaunchOptions({}, present()))).toBe(false);
  });

  it("does not ask for the card when only the device or only the libraries are there", () => {
    expect(browserLaunchOptions({}, present(DEVICE))).toEqual({});
    expect(browserLaunchOptions({}, present(LIBRARY))).toEqual({});
  });

  it("asks for the card with the flag and both of Mesa's settings together", () => {
    const options = browserLaunchOptions({ HOME: "/home/node" }, present(DEVICE, LIBRARY));
    expect(options.args).toEqual(["--use-angle=gl-egl", "--disable-gpu-compositing"]);
    expect(options.env).toEqual({ HOME: "/home/node", GALLIUM_DRIVER: "d3d12", LD_LIBRARY_PATH: "/usr/lib/wsl/lib" });
    expect(asksForCard(options)).toBe(true);
  });

  it("keeps a library path the environment already had, after the card's", () => {
    const options = browserLaunchOptions({ LD_LIBRARY_PATH: "/opt/tools/lib" }, present(DEVICE, LIBRARY));
    expect(options.env?.LD_LIBRARY_PATH).toBe("/usr/lib/wsl/lib:/opt/tools/lib");
  });

  it("leaves out variables the environment lists without a value", () => {
    const options = browserLaunchOptions({ EMPTY: undefined, SET: "1" }, present(DEVICE, LIBRARY));
    expect(options.env).not.toHaveProperty("EMPTY");
    expect(options.env?.SET).toBe("1");
  });

  it("draws in software on request though a card is there", () => {
    expect(browserLaunchOptions({ [RENDERER_VARIABLE]: "software" }, present(DEVICE, LIBRARY))).toEqual({});
  });
});
