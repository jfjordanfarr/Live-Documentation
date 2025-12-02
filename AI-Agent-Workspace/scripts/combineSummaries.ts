import { promises as fs } from "node:fs";
import path from "node:path";

interface Options {
  dir: string;
  output?: string;
}

function parseArgs(argv: string[]): Options {
  const opts: Options = { dir: process.cwd() };
  const queue = [...argv];

  const next = () => queue.shift();

  while (queue.length > 0) {
    const token = next();
    if (!token) continue;

    switch (token) {
      case "--dir":
      case "-d": {
        const value = next();
        if (!value) {
          throw new Error("--dir expects a path argument");
        }
        opts.dir = value;
        break;
      }
      case "--output":
      case "-o": {
        const value = next();
        if (!value) {
          throw new Error("--output expects a path argument");
        }
        opts.output = value;
        break;
      }
      default: {
        if (opts.dir === process.cwd()) {
          opts.dir = token;
        } else if (!opts.output) {
          opts.output = token;
        } else {
          throw new Error(`Unexpected argument: ${token}`);
        }
      }
    }
  }

  return opts;
}

async function gatherSummaries(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await gatherSummaries(fullPath);
      files.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith(".SUMMARIZED.md")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function combineSummaries(options: Options): Promise<string> {
  const dir = path.resolve(options.dir);
  const summaryFiles = (await gatherSummaries(dir)).sort((a, b) => a.localeCompare(b));

  if (summaryFiles.length === 0) {
    throw new Error(`No .SUMMARIZED.md files found in ${dir}`);
  }

  const sections: string[] = [];
  for (const file of summaryFiles) {
    const content = await fs.readFile(file, "utf8");
    const relative = path.relative(dir, file) || path.basename(file);
    sections.push(`<!-- BEGIN ${relative} -->\n\n${content.trim()}\n\n<!-- END ${relative} -->`);
  }

  return sections.join("\n\n");
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const combined = await combineSummaries(options);

  if (options.output) {
    const outputPath = path.resolve(options.output);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, combined, "utf8");
  } else {
    process.stdout.write(combined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
