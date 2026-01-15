// Package processor provides core processing logic for the Rosetta benchmark fixture.
//
// This package exercises multiple import patterns:
// - Package imports: rosetta/src/models
// - Selective usage: helpers.Format, helpers.Sum, helpers.Average
package processor

import (
	"fmt"
	"rosetta/src/helpers"
	"rosetta/src/models"
	"rosetta/src/types"
	"time"
)

// DefaultConfig returns the default configuration for processing.
func DefaultConfig() types.ProcessorConfig {
	return types.NewProcessorConfig(100, 5000, true)
}

// Run processes a batch of records and generates a report.
//
// Uses package imports to access Record and Report types,
// demonstrating how adapters should handle Go imports.
func Run(records []models.Record, config *types.ProcessorConfig) models.Report {
	cfg := DefaultConfig()
	if config != nil {
		cfg = *config
	}

	if !models.ValidateConfig(cfg) {
		panic("Invalid processor configuration")
	}

	values := make([]float64, len(records))
	for i, r := range records {
		values[i] = r.Value
	}

	total := helpers.Sum(values)
	avg := helpers.Average(values)

	return models.Report{
		Total:       total,
		Average:     avg,
		Records:     records,
		GeneratedAt: time.Now(),
	}
}

// Summarize creates a formatted summary string from a report.
func Summarize(report models.Report) string {
	return fmt.Sprintf(
		"Total: %s, Average: %s, Count: %d",
		helpers.Format(report.Total),
		helpers.Format(report.Average),
		len(report.Records),
	)
}
