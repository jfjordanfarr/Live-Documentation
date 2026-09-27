/**
 * Shared type definitions for the Rosetta benchmark fixture.
 * 
 * This file defines base types that other modules depend on,
 * testing how adapters resolve type-only imports.
 */

/** Status enumeration for records. */
export enum Status {
  Pending = "pending",
  Active = "active",
  Complete = "complete"
}

/** A timestamped entry in the data pipeline. */
export interface Entry {
  id: string;
  timestamp: Date;
  status: Status;
}

/** Configuration for processing operations. */
export interface ProcessorConfig {
  batchSize: number;
  timeout: number;
  strict: boolean;
}
