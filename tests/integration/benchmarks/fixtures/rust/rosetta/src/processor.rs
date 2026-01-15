//! Core processing logic for the Rosetta benchmark fixture.
//!
//! This module exercises multiple import patterns:
//! - Glob use: `use crate::models::*`
//! - Selective use: `use crate::helpers::{format, sum, average}`
//! - Type imports: `use crate::types::ProcessorConfig`

use crate::models::{self, Record, Report, validate_config};
use crate::types::ProcessorConfig;
use crate::helpers::{format, sum, average};

/// Default configuration for processing.
fn default_config() -> ProcessorConfig {
    ProcessorConfig::new(100, 5000, true)
}

/// Processes a batch of records and generates a report.
///
/// Uses module imports to access Record and Report types,
/// demonstrating how adapters should handle various use patterns.
///
/// # Arguments
/// * `records` - Records to process
/// * `config` - Optional processing configuration
///
/// # Returns
/// Summary report of processed records
///
/// # Panics
/// Panics if configuration is invalid
pub fn run(records: Vec<Record>, config: Option<ProcessorConfig>) -> Report {
    let config = config.unwrap_or_else(default_config);

    if !validate_config(&config) {
        panic!("Invalid processor configuration");
    }

    let values: Vec<f64> = records.iter().map(|r| r.value).collect();
    let total = sum(&values);
    let avg = average(&values);

    Report::new(total, avg, records)
}

/// Creates a formatted summary string from a report.
///
/// # Arguments
/// * `report` - Report to summarize
///
/// # Returns
/// Human-readable summary
pub fn summarize(report: &Report) -> String {
    format!(
        "Total: {}, Average: {}, Count: {}",
        format(report.total),
        format(report.average),
        report.records.len()
    )
}
