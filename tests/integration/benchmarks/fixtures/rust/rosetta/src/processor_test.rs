//! Unit tests for the Processor module.
//!
//! This test file exercises name-matched test detection:
//! processor_test.rs should automatically back processor.rs.

#[cfg(test)]
mod tests {
    use crate::processor::{run, summarize};
    use crate::models::{Record, Report};

    #[test]
    fn run_processes_records_and_returns_report() {
        let records = vec![
            Record::create(1, "A".to_string(), 100.0),
            Record::create(2, "B".to_string(), 200.0),
            Record::create(3, "C".to_string(), 150.0),
        ];

        let report = run(&records, None);

        assert!((report.total - 450.0).abs() < 0.001);
        assert!((report.average - 150.0).abs() < 0.001);
        assert_eq!(report.records.len(), 3);
    }

    #[test]
    fn run_handles_empty_record_set() {
        let report = run(&vec![], None);

        assert!((report.total - 0.0).abs() < 0.001);
        assert_eq!(report.records.len(), 0);
    }

    #[test]
    fn summarize_formats_report_as_human_readable_string() {
        let report = Report {
            total: 450.0,
            average: 150.0,
            records: vec![],
        };

        let summary = summarize(&report);

        assert!(!summary.is_empty());
    }
}
