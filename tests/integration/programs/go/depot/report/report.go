package report

import (
	"sort"

	"example.com/depot/stock"
	"example.com/depot/store"
)

// Write renders one line per item the inventory has on hand, in SKU order.
func Write(inventory store.Inventory, lookup func(sku string) (stock.Item, bool)) []string {
	onHand := inventory.OnHand()
	skus := make([]string, 0, len(onHand))
	for sku := range onHand {
		skus = append(skus, sku)
	}
	sort.Strings(skus)
	lines := make([]string, 0, len(skus))
	for _, sku := range skus {
		item, ok := lookup(sku)
		if !ok {
			continue
		}
		lines = append(lines, format(Line{Item: item, OnHand: onHand[sku]}))
	}
	return lines
}

// Total adds up values of any number type the stock package allows.
func Total[T stock.Number](values []T) T {
	var total T
	for _, value := range values {
		total += value
	}
	return total
}
