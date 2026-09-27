//! Domain models for the Rosetta benchmark fixture.
//!
//! Defines Record and Report types used throughout the pipeline.

use crate::types::{Entry, ProcessorConfig, Status};
use std::time::{SystemTime, UNIX_EPOCH};

/// A data record to be processed.
#[derive(Debug, Clone)]
pub struct Record {
    pub entry: Entry,
    pub value: f64,
    pub tags: Vec<String>,
}

impl Record {
    /// Creates a new record with sensible defaults.
    pub fn new(id: &str, value: f64) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self {
            entry: Entry {
                id: id.to_string(),
                timestamp,
                status: Status::Pending,
            },
            value,
            tags: Vec::new(),
        }
    }
}

/// Summary report produced by the processor.
#[derive(Debug, Clone)]
pub struct Report {
    pub total: f64,
    pub average: f64,
    pub records: Vec<Record>,
    pub generated_at: u64,
}

impl Report {
    /// Creates a new report with the current timestamp.
    pub fn new(total: f64, average: f64, records: Vec<Record>) -> Self {
        let generated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        Self { total, average, records, generated_at }
    }
}

/// Factory function for creating records with sensible defaults.
pub fn create_record(id: &str, value: f64) -> Record {
    Record::new(id, value)
}

/// Validates configuration is within acceptable bounds.
pub fn validate_config(config: &ProcessorConfig) -> bool {
    config.batch_size > 0 && 
    config.timeout > 0 && 
    config.batch_size <= 1000
}
