// Package helpers provides utility functions for the Rosetta benchmark fixture.
//
// Pure functions with no external dependencies - testing
// that adapters correctly identify leaf nodes in the graph.
package helpers

import "fmt"

// Format formats a numeric value for display.
func Format(value float64) string {
	return fmt.Sprintf("%.2f", value)
}

// Validate checks that a string is a valid identifier.
func Validate(input string) bool {
	if len(input) == 0 {
		return false
	}
	for i, r := range input {
		if i == 0 {
			if !isLetter(r) {
				return false
			}
		} else {
			if !isLetter(r) && !isDigit(r) && r != '_' && r != '-' {
				return false
			}
		}
	}
	return true
}

// Sum computes the sum of numeric values.
func Sum(values []float64) float64 {
	var total float64
	for _, v := range values {
		total += v
	}
	return total
}

// Average computes the average of numeric values.
func Average(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	return Sum(values) / float64(len(values))
}

func isLetter(r rune) bool {
	return (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z')
}

func isDigit(r rune) bool {
	return r >= '0' && r <= '9'
}
