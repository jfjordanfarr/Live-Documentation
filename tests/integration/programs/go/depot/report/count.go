package report

// Count is how many lines a report has. Its local named format is not the formatter in format.go.
func Count(lines []string) int {
	format := 0
	for range lines {
		format++
	}
	return format
}
