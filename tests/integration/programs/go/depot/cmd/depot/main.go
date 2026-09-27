// Command depot receives two items and prints the report.
package main

import (
	"fmt"

	_ "example.com/depot/internal/audit"
	"example.com/depot/report"
	"example.com/depot/stock"
	memstore "example.com/depot/store/memory"
)

func main() {
	inventory := memstore.New()
	inventory.Listen(func(item stock.Item, delta stock.Quantity) {
		fmt.Println("moved", item.SKU)
	})
	inventory.Receive(stock.Item{SKU: "A-1", Name: "Anvil", Unit: stock.Each}, stock.Quantity{Amount: 2, Unit: stock.Each})
	inventory.Receive(stock.Item{SKU: "B-2", Name: "Bolts", Unit: stock.Kilogram}, stock.Quantity{Amount: 1.5, Unit: stock.Kilogram})
	// The words store.Inventory and audit.Log here are a comment, not references.
	for _, line := range report.Write(inventory, inventory.Item) {
		fmt.Println(line)
	}
	fmt.Println("stock.Item lines:", report.Count(report.Write(inventory, inventory.Item)))
}
