import { promises as fs } from "node:fs";
import path from "node:path";

interface Options {
  dir: string;
  output?: string;
}

// Minimal CLI helper that merges *.SUMMARIZED.md files in a directory.
function parseArgs(argv: string[]): Options {
  const opts: Options = { dir: process.cwd() };

  const queue = [...argv];
  const consume = () => queue.shift();

  while (queue.length > 0) {
    const token = consume();
    if (!token) continue;

    switch (token) {
      case "--dir":
      case "-d": {
        const value = consume();
        if (!value) {
          throw new Error("--dir expects a path argument");
        }
        opts.dir = value;
        break;
      }
      case "--output":
      case "-o": {
        const value = consume();
        if (!value) {
          throw new Error("--output expects a path argument");
        }
        opts.output = value;
        break;
      }
      default: {
        if (!opts.dir || opts.dir === process.cwd()) {
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

async function combineSummaries(options: Options): Promise<string> {
  const dir = path.resolve(options.dir);
  const entries = await fs.readdir(dir);
  const summaryFiles = entries
    .filter((name) => name.endsWith(".SUMMARIZED.md"))
    .sort((a, b) => a.localeCompare(b));

  if (summaryFiles.length === 0) {
    throw new Error(`No .SUMMARIZED.md files found in ${dir}`);
  }

  const chunks: string[] = [];
  for (const file of summaryFiles) {
    const fullPath = path.join(dir, file);
    const content = await fs.readFile(fullPath, "utf8");
    const header = `<!-- BEGIN ${file} -->`;
    const footer = `<!-- END ${file} -->`;
    chunks.push(`${header}\n\n${content.trim()}\n\n${footer}`);
  }

  return chunks.join("\n\n");
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
