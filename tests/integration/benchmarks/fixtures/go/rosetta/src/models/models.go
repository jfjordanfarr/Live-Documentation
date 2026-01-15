// Package models provides domain models for the Rosetta benchmark fixture.
//
// Defines Record and Report types used throughout the pipeline.
package models

import (
	"rosetta/src/types"
	"time"
)

// Record represents a data record to be processed.
type Record struct {
	types.Entry
	Value float64
	Tags  []string
}

// Report represents a summary produced by the processor.
type Report struct {
	Total       float64
	Average     float64
	Records     []Record
	GeneratedAt time.Time
}

// CreateRecord is a factory for creating records with sensible defaults.
func CreateRecord(id string, value float64) Record {
	return Record{
		Entry: types.Entry{
			ID:        id,
			Timestamp: time.Now().Unix(),
			Status:    types.StatusPending,
		},
		Value: value,
		Tags:  []string{},
	}
}

// ValidateConfig validates that a configuration is within acceptable bounds.
func ValidateConfig(config types.ProcessorConfig) bool {
	return config.BatchSize > 0 &&
		config.Timeout > 0 &&
		config.BatchSize <= 1000
}
