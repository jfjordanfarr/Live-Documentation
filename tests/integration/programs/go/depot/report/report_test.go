package report_test

import (
	"testing"

	"example.com/depot/report"
	. "example.com/depot/stock"
	"example.com/depot/store/memory"
)

func TestWriteListsEveryItemInOrder(t *testing.T) {
	inventory := memstore.New()
	inventory.Receive(Item{SKU: "B-2", Name: "Bolts", Unit: Kilogram}, Quantity{Amount: 1.5, Unit: Kilogram})
	inventory.Receive(Item{SKU: "A-1", Name: "Anvil", Unit: Each}, Quantity{Amount: 2, Unit: Each})
	lines := report.Write(inventory, inventory.Item)
	if report.Count(lines) != 2 || lines[0][:3] != "A-1" {
		t.Fatalf("got %v", lines)
	}
	if report.Total([]float64{1.5, 2}) != 3.5 {
		t.Fatal("wrong total")
	}
}
