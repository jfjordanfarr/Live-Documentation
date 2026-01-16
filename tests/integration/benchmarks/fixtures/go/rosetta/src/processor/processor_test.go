// Package processor tests for the processor module.
//
// This test file exercises name-matched test detection:
// processor_test.go should automatically back processor.go.
package processor

import (
	"rosetta/src/models"
	"testing"
)

func TestRun(t *testing.T) {
	t.Run("processes records and returns report", func(t *testing.T) {
		records := []models.Record{
			models.CreateRecord(1, "A", 100),
			models.CreateRecord(2, "B", 200),
			models.CreateRecord(3, "C", 150),
		}

		report := Run(records, nil)

		if report.Total != 450 {
			t.Errorf("expected total 450, got %f", report.Total)
		}
		if report.Average != 150 {
			t.Errorf("expected average 150, got %f", report.Average)
		}
		if len(report.Records) != 3 {
			t.Errorf("expected 3 records, got %d", len(report.Records))
		}
	})

	t.Run("handles empty record set", func(t *testing.T) {
		report := Run([]models.Record{}, nil)

		if report.Total != 0 {
			t.Errorf("expected total 0, got %f", report.Total)
		}
		if len(report.Records) != 0 {
			t.Errorf("expected 0 records, got %d", len(report.Records))
		}
	})
}

func TestSummarize(t *testing.T) {
	t.Run("formats report as human-readable string", func(t *testing.T) {
		report := models.Report{
			Total:   450,
			Average: 150,
			Records: []models.Record{},
		}

		summary := Summarize(&report)

		if len(summary) == 0 {
			t.Error("expected non-empty summary")
		}
	})
}
