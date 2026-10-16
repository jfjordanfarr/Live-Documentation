// Package ledger keeps the running total of what the shelves hold.
package ledger

// Sum adds the counts given.
func Sum(counts ...int) int {
	total := 0
	for _, count := range counts {
		total += count
	}
	return total
}
