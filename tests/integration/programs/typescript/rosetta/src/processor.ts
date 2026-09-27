/**
 * Core processing logic for the Rosetta benchmark fixture.
 * 
 * This module exercises multiple import patterns:
 * - Namespace import: `import * as Models from "./models"`
 * - Selective imports: `import { format, sum } from "./helpers"`
 * - Type-only import: `import type { ProcessorConfig } from "./types"`
 */

import * as Models from "./models";
import type { ProcessorConfig, Status } from "./types";
import { format, sum, average } from "./helpers";

/** Default configuration for processing. */
const DEFAULT_CONFIG: ProcessorConfig = {
  batchSize: 100,
  timeout: 5000,
  strict: true
};

/**
 * Processes a batch of records and generates a report.
 * 
 * Uses namespace import (Models.*) to access Record and Report types,
 * demonstrating how adapters should handle wildcard imports.
 * 
 * @param records - Records to process
 * @param config - Optional processing configuration  
 * @returns Summary report of processed records
 */
export function run(
  records: Models.Record[], 
  config: ProcessorConfig = DEFAULT_CONFIG
): Models.Report {
  if (!Models.validateConfig(config)) {
    throw new Error("Invalid processor configuration");
  }

  const values = records.map(r => r.value);
  const total = sum(values);
  const avg = average(values);

  return {
    total,
    average: avg,
    records,
    generatedAt: new Date()
  };
}

/**
 * Creates a formatted summary string from a report.
 * 
 * @param report - Report to summarize
 * @returns Human-readable summary
 */
export function summarize(report: Models.Report): string {
  return `Total: ${format(report.total)}, Average: ${format(report.average)}, Count: ${report.records.length}`;
}
