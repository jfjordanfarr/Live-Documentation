//! Entry point for the Rosetta benchmark fixture.
//!
//! Demonstrates selective imports and serves as the
//! root node of the dependency graph.

mod helpers;
mod models;
mod processor;
mod types;

use models::{create_record, Report};
use processor::{run, summarize};

/// Executes the Rosetta data pipeline.
///
/// # Arguments
/// * `seed` - Starting seed value for generating records
///
/// # Returns
/// Formatted summary of the processing results
pub fn main(seed: i32) -> String {
    // Create test records using the factory
    let records = vec![
        create_record("alpha", seed as f64),
        create_record("beta", (seed * 2) as f64),
        create_record("gamma", (seed * 3) as f64),
    ];

    // Process and generate report
    let report: Report = run(records, None);

    // Return human-readable summary
    summarize(&report)
}

#[cfg(not(test))]
fn main_entry() {
    println!("{}", main(10));
}
