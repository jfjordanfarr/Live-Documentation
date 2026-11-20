// What one file-system call costs here, synchronously on one thread, so that the tree writer's and the generator's
// system time can be read against it: create-write-close of a small file, lstat of a name that is absent and of one
// that stands, and removal, in a fresh folder under each place given.
//   node syscall-cost.cjs <folder> [<folder> ...]
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const N = 5000;
const body = Buffer.alloc(2048, 97);
for (const place of process.argv.slice(2)) {
  const folder = fs.mkdtempSync(path.join(place, "sc-"));
  const time = (work) => {
    const cpu = process.cpuUsage();
    const began = performance.now();
    work();
    const used = process.cpuUsage(cpu);
    return { us: +(((performance.now() - began) * 1000) / N).toFixed(1), sysUs: +(used.system / N).toFixed(1) };
  };
  const names = Array.from({ length: N }, (_, i) => path.join(folder, `d${i % 50}`, `f${i}.txt`));
  for (let d = 0; d < 50; d += 1) fs.mkdirSync(path.join(folder, `d${d}`));
  const absent = time(() => {
    for (const name of names) {
      try {
        fs.lstatSync(name);
      } catch {
        // absent, as the tree writer expects before each entry
      }
    }
  });
  const create = time(() => {
    for (const name of names) {
      const fd = fs.openSync(name, "wx", 0o666);
      fs.writeSync(fd, body);
      fs.closeSync(fd);
    }
  });
  const stands = time(() => {
    for (const name of names) fs.lstatSync(name);
  });
  const read = time(() => {
    for (const name of names) fs.readFileSync(name);
  });
  const remove = time(() => {
    for (const name of names) fs.unlinkSync(name);
  });
  fs.rmSync(folder, { recursive: true, force: true });
  console.log(JSON.stringify({ place, perCall: { lstatAbsent: absent, createWriteClose: create, lstatStanding: stands, readFile: read, unlink: remove } }));
}
