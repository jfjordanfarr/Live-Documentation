// Package main integration tests for the complete data processing pipeline.
//
// This test file exercises NON-name-matched test detection:
// pipeline_test.go imports processor and models, so those files
// should appear as "test-backed" in the Explorer even without
// a directly name-matched test file.
package main

import (
	"rosetta/src/models"
	"rosetta/src/processor"
	"rosetta/src/types"
	"strings"
	"testing"
)

func TestPipelineIntegration(t *testing.T) {
	t.Run("processes records through complete pipeline", func(t *testing.T) {
		// Create test records using models factory
		records := []models.Record{
			models.CreateRecord(1, "Alpha", 100),
			models.CreateRecord(2, "Beta", 200),
			models.CreateRecord(3, "Gamma", 300),
		}

		// Process through processor
		report := processor.Run(records, nil)

		// Verify report structure
		if report.Total != 600 {
			t.Errorf("expected total 600, got %f", report.Total)
		}
		if report.Average != 200 {
			t.Errorf("expected average 200, got %f", report.Average)
		}
		if len(report.Records) != 3 {
			t.Errorf("expected 3 records, got %d", len(report.Records))
		}

		// Verify summarization
		summary := processor.Summarize(&report)
		if !strings.Contains(summary, "600") {
			t.Errorf("expected summary to contain '600', got %s", summary)
		}
	})

	t.Run("validates configuration before processing", func(t *testing.T) {
		validConfig := types.ProcessorConfig{
			BatchSize: 100,
			Timeout:   5000,
			Strict:    true,
		}

		invalidConfig := types.ProcessorConfig{
			BatchSize: -1,
			Timeout:   0,
			Strict:    false,
		}

		if !models.ValidateConfig(validConfig) {
			t.Error("expected valid config to pass validation")
		}
		if models.ValidateConfig(invalidConfig) {
			t.Error("expected invalid config to fail validation")
		}
	})

	t.Run("handles edge cases in pipeline", func(t *testing.T) {
		// Empty input
		emptyReport := processor.Run([]models.Record{}, nil)
		if emptyReport.Total != 0 {
			t.Errorf("expected total 0, got %f", emptyReport.Total)
		}

		// Single record
		singleRecord := []models.Record{models.CreateRecord(1, "Solo", 42)}
		singleReport := processor.Run(singleRecord, nil)
		if singleReport.Average != 42 {
			t.Errorf("expected average 42, got %f", singleReport.Average)
		}
	})
}
