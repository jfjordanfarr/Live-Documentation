// Package main is the entry point for the Rosetta benchmark fixture.
//
// Demonstrates package imports and serves as the
// root node of the dependency graph.
package main

import (
	"fmt"
	"rosetta/src/models"
	"rosetta/src/processor"
)

// Main executes the Rosetta data pipeline.
//
// Creates test records using the factory, processes them,
// and returns a formatted summary.
func Main(seed int) string {
	// Create test records using the factory
	records := []models.Record{
		models.CreateRecord("alpha", float64(seed)),
		models.CreateRecord("beta", float64(seed*2)),
		models.CreateRecord("gamma", float64(seed*3)),
	}

	// Process and generate report
	report := processor.Run(records, nil)

	// Return human-readable summary
	return processor.Summarize(report)
}

func main() {
	fmt.Println(Main(10))
}
