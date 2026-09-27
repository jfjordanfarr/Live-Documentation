"""
Integration tests for the complete data processing pipeline.

This test file exercises NON-name-matched test detection:
test_pipeline.py imports processor and models, so those files
should appear as "test-backed" in the Explorer even without
a directly name-matched test file.
"""

import pytest
from processor import run, summarize
from models import create_record, validate_config, Record, Report
from core_types import ProcessorConfig


class TestPipelineIntegration:
    def test_processes_records_through_complete_pipeline(self):
        # Create test records using models factory
        records = [
            create_record(1, "Alpha", 100),
            create_record(2, "Beta", 200),
            create_record(3, "Gamma", 300)
        ]

        # Process through processor
        report = run(records)

        # Verify report structure
        assert report.total == 600
        assert report.average == 200
        assert report.records == records
        assert report.generated_at is not None

        # Verify summarization
        summary = summarize(report)
        assert "600" in summary
        assert "Count: 3" in summary

    def test_validates_configuration_before_processing(self):
        valid_config = ProcessorConfig(
            batch_size=100,
            timeout=5000,
            strict=True
        )

        invalid_config = ProcessorConfig(
            batch_size=-1,
            timeout=0,
            strict=False
        )

        assert validate_config(valid_config) is True
        assert validate_config(invalid_config) is False

    def test_handles_edge_cases_in_pipeline(self):
        # Empty input
        empty_report = run([])
        assert empty_report.total == 0
        assert len(empty_report.records) == 0

        # Single record
        single_record = [create_record(1, "Solo", 42)]
        single_report = run(single_record)
        assert single_report.average == 42
