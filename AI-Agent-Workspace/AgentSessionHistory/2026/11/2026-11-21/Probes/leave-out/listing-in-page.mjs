#!/usr/bin/env node
// How long a page takes to be handed a folder through `<input webkitdirectory>`, which lists everything beneath the
// folder before the page sees anything, and to make its listing of names from what it is handed. Only through the
// browser lane:   node listing-in-page.mjs <folder> [rate]
// A lazy walk through a directory handle (`showDirectoryPicker`) cannot be driven by an automated browser: the
// picker's own prompt cannot be pressed (the probe of 2026-11-19), so it is not timed here.
import { chromium } from "@playwright/test";
import os from "node:os";

const [folder, rateText = "1"] = process.argv.slice(2);
const rate = Number(rateText);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><input id="folder" type="file" webkitdirectory><script>
  window.handed = new Promise((resolve) => document.getElementById("folder").addEventListener("change", (event) => {
    const started = performance.now();
    const names = Array.from(event.target.files, (file) => file.webkitRelativePath.split("/").slice(1).join("/"));
    resolve({ files: names.length, namesMs: performance.now() - started });
  }));
</script>`);
const cdp = await page.context().newCDPSession(page);
if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
const started = Date.now();
await page.setInputFiles("#folder", folder, { timeout: 240_000 });
const handed = await page.evaluate(() => window.handed);
console.log(JSON.stringify({ where: "page, webkitdirectory", rate, cores: os.availableParallelism(), handedMs: Date.now() - started, ...handed, load: os.loadavg()[0].toFixed(1) }));
await browser.close();
