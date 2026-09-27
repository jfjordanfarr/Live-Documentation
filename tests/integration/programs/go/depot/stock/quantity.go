package stock

import "fmt"

// Unit is how a quantity is counted.
type Unit int

const (
	// Each counts whole items.
	Each Unit = iota
	// Kilogram counts by weight.
	Kilogram
)

// Number is what a total can be made of.
type Number interface {
	~int | ~float64
}

// Quantity is an amount of stock in a unit.
type Quantity struct {
	Amount float64
	Unit   Unit
}

// Plus adds another quantity of the same unit.
func (q Quantity) Plus(other Quantity) (Quantity, error) {
	if other.Unit != q.Unit {
		return Quantity{}, fmt.Errorf("units differ: %v and %v", q.Unit, other.Unit)
	}
	return Quantity{Amount: q.Amount + other.Amount, Unit: q.Unit}, nil
}

// format renders a quantity for a report line; item.go uses it.
func format(q Quantity) string {
	label := "ea"
	if q.Unit == Kilogram {
		label = "kg"
	}
	return fmt.Sprintf("%.1f %s", q.Amount, label)
}
