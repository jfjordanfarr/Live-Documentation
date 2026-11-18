import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
await build({ entryPoints: [path.join(root, "packages/explorer/src/client/index.ts")], outfile: "/tmp/live-docs-20261108-defaults-diagnostics/profile.js",
  bundle: true, format: "esm", minify: true, target: "es2022", logLevel: "silent", loader: { ".ts": "ts" },
  plugins: [{ name: "profile-existing-phases", setup(builder) {
    builder.onLoad({ filter: /forceGraphView\.ts$/ }, async args => {
      let source = await readFile(args.path, "utf8");
      const start = source.indexOf("  function animateFocus(): void {"), end = source.indexOf("\n  function ", start + 10);
      if (start < 0 || end < 0) throw new Error("Missing animation seam");
      let body = source.slice(start, end).replace("    animation = 0;", `    const frameAt = performance.now();
        if (lastProfileFrame) profileRecord('cadence', frameAt - lastProfileFrame); lastProfileFrame = frameAt;
        animation = 0;`);
      for (const [name, call] of [["physics", "simulation.tick()"], ["frameDirectory", "frameDirectory()"], ["buildBodies", "buildBodies()"], ["bursts", "advanceBursts()"], ["controls", "instance.updateControls()"], ["focusAndNames", "updateFocus(performance.now())"], ["draw", "instance.draw(pictureRevision)"], ["hover", "updatePointerHover()"], ["grow", "grow()"]]) {
        if (!body.includes(call + ";")) throw new Error(`Missing phase ${name}`);
        body = body.replace(call + ";", `profileCall('${name}', () => ${call});`);
      }
      const close = body.lastIndexOf("\n  }");
      body = body.slice(0, close) + "\n    profileRecord('frameCpu', performance.now() - frameAt);" + body.slice(close);
      const helpers = `  const profileTimes: Record<string, {count:number;total:number;max:number}> = {};
        let lastProfileFrame = 0;
        function profileRecord(name:string, time:number):void { const row = profileTimes[name] ??= {count:0,total:0,max:0}; row.count++; row.total+=time; row.max=Math.max(row.max,time); }
        function profileCall(name:string, callback:()=>unknown):void { const at=performance.now(); callback(); profileRecord(name,performance.now()-at); }
        (window as unknown as { forceProfile: () => unknown }).forceProfile = () => ({
          timings: profileTimes, simulationRunning, motionStill:motion?.still, revision:motion?.revision,
          packing:[...packing.keys()], reveal:{shown:reveal.shown,total:reveal.order.length}
        });\n`;
      source = source.slice(0, start) + helpers + body + source.slice(end);
      return { contents: source, loader: "ts", resolveDir: path.dirname(args.path) };
    });
  } }]
});
