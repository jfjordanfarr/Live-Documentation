/**
 * Domain models for the Rosetta benchmark fixture.
 * 
 * Defines Record and Report types used throughout the pipeline.
 */

import { Entry, Status, ProcessorConfig } from "./types";

/** A data record to be processed. */
export interface Record extends Entry {
  value: number;
  tags: string[];
}

/** Summary report produced by the processor. */
export interface Report {
  total: number;
  average: number;
  records: Record[];
  generatedAt: Date;
}

/** Factory for creating records with sensible defaults. */
export function createRecord(id: string, value: number): Record {
  return {
    id,
    value,
    timestamp: new Date(),
    status: Status.Pending,
    tags: []
  };
}

/** Validates configuration is within acceptable bounds. */
export function validateConfig(config: ProcessorConfig): boolean {
  return config.batchSize > 0 && 
         config.timeout > 0 && 
         config.batchSize <= 1000;
}
