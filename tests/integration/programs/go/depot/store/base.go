package store

import "example.com/depot/stock"

// Base keeps listeners for an inventory to embed.
type Base struct {
	listeners []Listener
}

// Listen registers a listener.
func (b *Base) Listen(listener Listener) {
	b.listeners = append(b.listeners, listener)
}

// Notify tells every listener about a movement.
func (b *Base) Notify(item stock.Item, delta stock.Quantity) {
	for _, listener := range b.listeners {
		listener(item, delta)
	}
}
