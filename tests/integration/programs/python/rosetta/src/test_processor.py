"""
Unit tests for the processor module.

This test file exercises name-matched test detection:
test_processor.py should automatically back processor.py.
"""

import pytest
from processor import run, summarize
from models import create_record, Report


class TestRun:
    def test_processes_records_and_returns_report(self):
        records = [
            create_record(1, "A", 100),
            create_record(2, "B", 200),
            create_record(3, "C", 150)
        ]

        report = run(records)

        assert report.total == 450
        assert report.average == 150
        assert len(report.records) == 3

    def test_handles_empty_record_set(self):
        report = run([])

        assert report.total == 0
        assert len(report.records) == 0


class TestSummarize:
    def test_formats_report_as_human_readable_string(self):
        report = Report(
            total=450,
            average=150,
            records=[],
            generated_at=None
        )

        summary = summarize(report)

        assert "Total" in summary
        assert "450" in summary
        assert "Average" in summary
