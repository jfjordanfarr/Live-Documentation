/**
 * Integration tests for the complete data processing pipeline.
 * 
 * This test file exercises NON-name-matched test detection:
 * pipeline.test.ts imports processor and models, so those files
 * should appear as "test-backed" in the Explorer even without
 * a directly name-matched test file.
 */

import { run, summarize } from "./processor";
import { createRecord, validateConfig, Record, Report } from "./models";
import type { ProcessorConfig } from "./types";

describe("pipeline integration", () => {
  it("processes records through the complete pipeline", () => {
    // Create test records using models factory
    const records: Record[] = [
      createRecord(1, "Alpha", 100),
      createRecord(2, "Beta", 200),
      createRecord(3, "Gamma", 300)
    ];

    // Process through processor
    const report = run(records);

    // Verify report structure
    expect(report.total).toBe(600);
    expect(report.average).toBe(200);
    expect(report.records).toEqual(records);
    expect(report.generatedAt).toBeInstanceOf(Date);

    // Verify summarization
    const summary = summarize(report);
    expect(summary).toContain("600");
    expect(summary).toContain("Count: 3");
  });

  it("validates configuration before processing", () => {
    const validConfig: ProcessorConfig = {
      batchSize: 100,
      timeout: 5000,
      strict: true
    };

    const invalidConfig: ProcessorConfig = {
      batchSize: -1,
      timeout: 0,
      strict: false
    };

    expect(validateConfig(validConfig)).toBe(true);
    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it("handles edge cases in the pipeline", () => {
    // Empty input
    const emptyReport = run([]);
    expect(emptyReport.total).toBe(0);
    expect(emptyReport.records).toHaveLength(0);

    // Single record
    const singleRecord = [createRecord(1, "Solo", 42)];
    const singleReport = run(singleRecord);
    expect(singleReport.average).toBe(42);
  });
});
