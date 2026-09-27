package report

import "example.com/depot/stock"

// Line is one line of a report.
type Line struct {
	Item   stock.Item
	OnHand stock.Quantity
}

// format renders a line; count.go has a local variable of the same name.
func format(line Line) string {
	return line.Item.Describe(line.OnHand)
}
