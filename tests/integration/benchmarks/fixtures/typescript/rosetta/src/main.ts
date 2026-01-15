/**
 * Entry point for the Rosetta benchmark fixture.
 * 
 * Demonstrates selective imports and serves as the
 * root node of the dependency graph.
 */

import { createRecord, Report } from "./models";
import { run, summarize } from "./processor";

/**
 * Executes the Rosetta data pipeline.
 * 
 * @param seed - Starting seed value for generating records
 * @returns Formatted summary of the processing results
 */
export function main(seed: number): string {
  // Create test records using the factory
  const records = [
    createRecord("alpha", seed),
    createRecord("beta", seed * 2),
    createRecord("gamma", seed * 3)
  ];

  // Process and generate report
  const report: Report = run(records);
  
  // Return human-readable summary
  return summarize(report);
}
