//! Utility helpers for the Rosetta benchmark fixture.
//!
//! Pure functions with no external dependencies - testing
//! that adapters correctly identify leaf nodes in the graph.

use regex::Regex;

/// Formats a numeric value for display.
pub fn format(value: f64) -> String {
    format!("{:.2}", value)
}

/// Validates that a string is a valid identifier.
pub fn validate(input: &str) -> bool {
    let re = Regex::new(r"^[a-zA-Z][a-zA-Z0-9_-]*$").unwrap();
    re.is_match(input)
}

/// Computes the sum of numeric values.
pub fn sum(values: &[f64]) -> f64 {
    values.iter().sum()
}

/// Computes the average of numeric values.
pub fn average(values: &[f64]) -> f64 {
    if values.is_empty() {
        0.0
    } else {
        sum(values) / values.len() as f64
    }
}
