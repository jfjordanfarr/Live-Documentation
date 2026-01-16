// Package helpers tests for the helpers module.
//
// This test file exercises name-matched test detection:
// helpers_test.go should automatically back helpers.go.
package helpers

import (
	"testing"
)

func TestFormat(t *testing.T) {
	t.Run("formats numbers with two decimal places", func(t *testing.T) {
		if Format(100) != "100.00" {
			t.Errorf("expected 100.00, got %s", Format(100))
		}
		if Format(0) != "0.00" {
			t.Errorf("expected 0.00, got %s", Format(0))
		}
	})
}

func TestSum(t *testing.T) {
	t.Run("sums a slice of numbers", func(t *testing.T) {
		result := Sum([]float64{1, 2, 3, 4, 5})
		if result != 15 {
			t.Errorf("expected 15, got %f", result)
		}

		result = Sum([]float64{100, 200, 300})
		if result != 600 {
			t.Errorf("expected 600, got %f", result)
		}
	})

	t.Run("returns 0 for empty slice", func(t *testing.T) {
		result := Sum([]float64{})
		if result != 0 {
			t.Errorf("expected 0, got %f", result)
		}
	})
}

func TestAverage(t *testing.T) {
	t.Run("calculates average of numbers", func(t *testing.T) {
		result := Average([]float64{10, 20, 30})
		if result != 20 {
			t.Errorf("expected 20, got %f", result)
		}
	})

	t.Run("returns 0 for empty slice", func(t *testing.T) {
		result := Average([]float64{})
		if result != 0 {
			t.Errorf("expected 0, got %f", result)
		}
	})
}
