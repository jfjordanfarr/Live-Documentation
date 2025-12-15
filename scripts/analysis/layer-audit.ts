import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type LayerId = "1" | "2" | "3" | "4";

interface HeadingStats {
  heading: string;
  count: number;
  coverage: number;
}

interface FileSummary {
  filePath: string;
  headings: string[];
  missingHeadings: string[];
  extraHeadings: string[];
}

interface LayerReport {
  layer: LayerId;
  totalFiles: number;
  canonicalHeadings: HeadingStats[];
  files: FileSummary[];
}

interface CliOptions {
  layers: LayerId[];
  threshold: number;
  limit?: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

async function readFileHeadings(filePath: string): Promise<string[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const result: string[] = [];
  const headingPattern = /^##\s+(.+?)\s*$/;

  for (const line of raw.split(/\r?\n/)) {
    const match = headingPattern.exec(line);
    if (match) {
      result.push(match[1].trim());
    }
  }

  return result;
}

export async function collectLayerReport(layer: LayerId, threshold: number): Promise<LayerReport> {
  const pattern = path.join(repoRoot, ".mdmd", `layer-${layer}`, "**", "*.mdmd.md");
  const files = await glob(pattern, { windowsPathsNoEscape: true });
  const headingFrequency = new Map<string, number>();
  const fileData: { filePath: string; headings: string[] }[] = [];

  for (const filePath of files) {
    const headings = await readFileHeadings(filePath);
    fileData.push({ filePath, headings });
    const uniqueHeadings = new Set(headings);
    for (const heading of uniqueHeadings) {
      headingFrequency.set(heading, (headingFrequency.get(heading) ?? 0) + 1);
    }
  }

  const totalFiles = fileData.length;
  const canonicalHeadings: HeadingStats[] = [];

  if (totalFiles > 0) {
    for (const [heading, count] of headingFrequency) {
      const coverage = count / totalFiles;
      if (coverage >= threshold) {
        canonicalHeadings.push({ heading, count, coverage });
      }
    }

    canonicalHeadings.sort((a, b) => b.coverage - a.coverage || a.heading.localeCompare(b.heading));
  }

  const canonicalSet = new Set(canonicalHeadings.map((entry) => entry.heading));

  const filesSummary: FileSummary[] = fileData.map(({ filePath, headings }) => {
    const headingSet = new Set(headings);
    const missingHeadings = canonicalHeadings
      .filter((entry) => !headingSet.has(entry.heading))
      .map((entry) => entry.heading);

    const extraHeadings = [...headingSet].filter((heading) => !canonicalSet.has(heading));

    return {
      filePath: path.relative(repoRoot, filePath),
      headings,
      missingHeadings,
      extraHeadings,
    };
  });

  return {
    layer,
    totalFiles,
    canonicalHeadings,
    files: filesSummary,
  };
}

export function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const layers = new Set<LayerId>();
  let threshold = 0.6;
  let limit: number | undefined;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--layer") {
      const value = args[i + 1];
      if (!value) {
        throw new Error("--layer requires a value");
      }
      i += 1;
      const normalized = value.trim();
      if (["1", "2", "3", "4"].includes(normalized)) {
        layers.add(normalized as LayerId);
      } else if (normalized === "all") {
        layers.add("1");
        layers.add("2");
        layers.add("3");
        layers.add("4");
      } else {
        throw new Error(`Unsupported layer: ${value}`);
      }
    } else if (arg === "--threshold") {
      const value = args[i + 1];
      if (!value) {
        throw new Error("--threshold requires a value");
      }
      i += 1;
      const parsed = Number.parseFloat(value);
      if (Number.isNaN(parsed) || parsed <= 0 || parsed > 1) {
        throw new Error("--threshold must be a number between 0 and 1");
      }
      threshold = parsed;
    } else if (arg === "--limit") {
      const value = args[i + 1];
      if (!value) {
        throw new Error("--limit requires a value");
      }
      i += 1;
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error("--limit must be a positive integer");
      }
      limit = parsed;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (layers.size === 0) {
    layers.add("1");
    layers.add("2");
    layers.add("3");
    layers.add("4");
  }

  return {
    layers: [...layers],
    threshold,
    limit,
  };
}

function printHelp() {
  // Purposefully brief so the script remains self-explanatory when run with --help.
  console.log(`Usage: tsx scripts/analysis/mdmd-layer-audit.ts [options]

Options:
  --layer <1|2|3|4|all>   Target a specific layer (default: all layers)
  --threshold <0-1>       Coverage threshold for canonical sections (default: 0.6)
  --limit <number>        Limit the number of unusual files reported per layer
  --help                  Show this message
`);
}

function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function logLayerReport(report: LayerReport, limit?: number) {
  console.log(`\nLayer ${report.layer} – ${report.totalFiles} files analysed`);
  if (report.totalFiles === 0) {
    console.log("  No files found.");
    return;
  }

  if (report.canonicalHeadings.length === 0) {
    console.log("  No canonical sections discovered at the chosen threshold.");
  } else {
    console.log("  Canonical sections:");
    for (const entry of report.canonicalHeadings) {
      console.log(`    - ${entry.heading} (${entry.count}/${report.totalFiles}, ${formatPercentage(entry.coverage)})`);
    }
  }

  const unusualFiles = report.files
    .map((file) => ({
      file,
      severity: file.missingHeadings.length * 2 + file.extraHeadings.length,
    }))
    .filter((entry) => entry.file.missingHeadings.length > 0 || entry.file.extraHeadings.length > 0)
    .sort((a, b) => b.severity - a.severity);

  if (unusualFiles.length === 0) {
    console.log("  All files include the canonical sections.");
    return;
  }

  console.log("  Files diverging from canonical sections:");
  unusualFiles.slice(0, limit ?? unusualFiles.length).forEach(({ file }) => {
    const missing = file.missingHeadings.length > 0 ? `missing: ${file.missingHeadings.join(", ")}` : undefined;
    const extras = file.extraHeadings.length > 0 ? `extra: ${file.extraHeadings.join(", ")}` : undefined;
    const detail = [missing, extras].filter(Boolean).join("; ");
    console.log(`    - ${file.filePath}${detail ? ` (${detail})` : ""}`);
  });
}

export async function main() {
  const options = parseArgs();
  const reports: LayerReport[] = [];

  for (const layer of options.layers) {
    const report = await collectLayerReport(layer, options.threshold);
    reports.push(report);
  }

  for (const report of reports) {
    logLayerReport(report, options.limit);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
