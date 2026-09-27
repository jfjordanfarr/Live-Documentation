//! Integration tests for the complete data processing pipeline.
//!
//! This test file exercises NON-name-matched test detection:
//! pipeline_test.rs imports processor and models, so those files
//! should appear as "test-backed" in the Explorer even without
//! a directly name-matched test file.

#[cfg(test)]
mod tests {
    use crate::processor::{run, summarize};
    use crate::models::{Record, validate_config};
    use crate::types::ProcessorConfig;

    #[test]
    fn processes_records_through_complete_pipeline() {
        // Create test records using models factory
        let records = vec![
            Record::create(1, "Alpha".to_string(), 100.0),
            Record::create(2, "Beta".to_string(), 200.0),
            Record::create(3, "Gamma".to_string(), 300.0),
        ];

        // Process through processor
        let report = run(&records, None);

        // Verify report structure
        assert!((report.total - 600.0).abs() < 0.001);
        assert!((report.average - 200.0).abs() < 0.001);
        assert_eq!(report.records.len(), 3);

        // Verify summarization
        let summary = summarize(&report);
        assert!(summary.contains("600"));
    }

    #[test]
    fn validates_configuration_before_processing() {
        let valid_config = ProcessorConfig {
            batch_size: 100,
            timeout: 5000,
            strict: true,
        };

        let invalid_config = ProcessorConfig {
            batch_size: -1,
            timeout: 0,
            strict: false,
        };

        assert!(validate_config(&valid_config));
        assert!(!validate_config(&invalid_config));
    }

    #[test]
    fn handles_edge_cases_in_pipeline() {
        // Empty input
        let empty_report = run(&vec![], None);
        assert!((empty_report.total - 0.0).abs() < 0.001);

        // Single record
        let single_record = vec![Record::create(1, "Solo".to_string(), 42.0)];
        let single_report = run(&single_record, None);
        assert!((single_report.average - 42.0).abs() < 0.001);
    }
}
