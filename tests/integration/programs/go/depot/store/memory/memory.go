// Package memstore is an inventory kept in memory. Its directory is named memory.
package memstore

import (
	"example.com/depot/stock"
	"example.com/depot/store"
)

// Memory is a store.Inventory that forgets everything when the process ends.
type Memory struct {
	store.Base
	items map[string]stock.Item
	stock map[string]stock.Quantity
}

// New makes an empty inventory.
func New() *Memory {
	return &Memory{items: map[string]stock.Item{}, stock: map[string]stock.Quantity{}}
}

// Receive adds stock of an item.
func (m *Memory) Receive(item stock.Item, delta stock.Quantity) (stock.Quantity, error) {
	current, ok := m.stock[item.SKU]
	if !ok {
		current = stock.Quantity{Unit: item.Unit}
	}
	next, err := current.Plus(delta)
	if err != nil {
		return stock.Quantity{}, err
	}
	m.items[item.SKU] = item
	m.stock[item.SKU] = next
	m.Notify(item, delta)
	return next, nil
}

// OnHand is everything on hand, by SKU.
func (m *Memory) OnHand() map[string]stock.Quantity {
	out := make(map[string]stock.Quantity, len(m.stock))
	for sku, quantity := range m.stock {
		out[sku] = quantity
	}
	return out
}

// Item is the item behind a SKU, if the inventory has seen it.
func (m *Memory) Item(sku string) (stock.Item, bool) {
	item, ok := m.items[sku]
	return item, ok
}

var _ store.Inventory = (*Memory)(nil)
