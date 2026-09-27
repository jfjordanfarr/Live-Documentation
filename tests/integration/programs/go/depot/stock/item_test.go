package stock_test

import (
	"strings"
	"testing"

	"example.com/depot/stock"
)

func TestDescribeStartsWithTheSKU(t *testing.T) {
	item := stock.Item{SKU: "A-1", Name: "Anvil", Unit: stock.Each}
	line := item.Describe(stock.Quantity{Amount: 2, Unit: stock.Each})
	if !strings.HasPrefix(line, "A-1") {
		t.Fatalf("got %q", line)
	}
}
