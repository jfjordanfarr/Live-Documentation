// Package types provides shared type definitions for the Rosetta benchmark fixture.
//
// This package defines base types that other packages depend on,
// testing how adapters resolve package imports.
package types

// Status represents the state of a record in the pipeline.
type Status string

const (
	// StatusPending indicates a record awaiting processing.
	StatusPending Status = "pending"
	// StatusActive indicates a record being processed.
	StatusActive Status = "active"
	// StatusComplete indicates a processed record.
	StatusComplete Status = "complete"
)

// Entry represents a timestamped item in the data pipeline.
type Entry struct {
	ID        string
	Timestamp int64
	Status    Status
}

// ProcessorConfig holds configuration for processing operations.
type ProcessorConfig struct {
	BatchSize int
	Timeout   int
	Strict    bool
}

// NewProcessorConfig creates a ProcessorConfig with the given parameters.
func NewProcessorConfig(batchSize, timeout int, strict bool) ProcessorConfig {
	return ProcessorConfig{
		BatchSize: batchSize,
		Timeout:   timeout,
		Strict:    strict,
	}
}
