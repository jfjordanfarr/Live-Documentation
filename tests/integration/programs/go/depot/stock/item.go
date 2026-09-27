package stock

// Item is something the depot keeps, identified by its SKU.
type Item struct {
	SKU  string
	Name string
	Unit Unit
}

// Describe is the item as a report line, using the formatter from quantity.go.
func (i Item) Describe(q Quantity) string {
	return i.SKU + "  " + i.Name + "  " + format(q)
}
