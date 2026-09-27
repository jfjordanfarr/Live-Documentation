package store

import "example.com/depot/stock"

// Inventory is where stock is kept.
type Inventory interface {
	// Receive adds stock of an item and returns what is on hand afterwards.
	Receive(item stock.Item, delta stock.Quantity) (stock.Quantity, error)
	// OnHand is everything on hand, by SKU.
	OnHand() map[string]stock.Quantity
}

// Listener is told about every movement of stock.
type Listener func(item stock.Item, delta stock.Quantity)
