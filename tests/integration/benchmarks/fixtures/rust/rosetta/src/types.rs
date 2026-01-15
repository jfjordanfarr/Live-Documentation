//! Shared type definitions for the Rosetta benchmark fixture.
//!
//! This file defines base types that other modules depend on,
//! testing how adapters resolve type imports.

/// Status enumeration for records.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Pending,
    Active,
    Complete,
}

/// A timestamped entry in the data pipeline.
#[derive(Debug, Clone)]
pub struct Entry {
    pub id: String,
    pub timestamp: u64,
    pub status: Status,
}

/// Configuration for processing operations.
#[derive(Debug, Clone)]
pub struct ProcessorConfig {
    pub batch_size: usize,
    pub timeout: u64,
    pub strict: bool,
}

impl ProcessorConfig {
    /// Creates a new processor configuration.
    pub fn new(batch_size: usize, timeout: u64, strict: bool) -> Self {
        Self { batch_size, timeout, strict }
    }
}
