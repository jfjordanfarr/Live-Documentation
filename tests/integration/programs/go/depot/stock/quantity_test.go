package stock

import "testing"

func TestPlusKeepsTheUnit(t *testing.T) {
	sum, err := Quantity{Amount: 1, Unit: Kilogram}.Plus(Quantity{Amount: 2, Unit: Kilogram})
	if err != nil || sum.Amount != 3 || sum.Unit != Kilogram {
		t.Fatalf("got %v, %v", sum, err)
	}
}

func TestPlusRejectsMixedUnits(t *testing.T) {
	if _, err := (Quantity{Unit: Each}).Plus(Quantity{Unit: Kilogram}); err == nil {
		t.Fatal("expected an error")
	}
}
