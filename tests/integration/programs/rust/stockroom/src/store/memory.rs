use std::collections::BTreeMap;

use super::{Inventory, Listener};
use crate::stock::{Item, Quantity};

/// An inventory kept in memory, with listeners.
#[derive(Default)]
pub struct Memory {
    stock: BTreeMap<String, (Item, Quantity)>,
    listeners: Vec<Listener>,
}

impl Memory {
    /// An empty inventory.
    pub fn new() -> Self {
        Self::default()
    }

    /// Registers a listener.
    pub fn listen(&mut self, listener: Listener) {
        self.listeners.push(listener);
    }
}

impl Inventory for Memory {
    fn receive(&mut self, item: Item, delta: Quantity) -> Result<Quantity, String> {
        let current = self.stock.get(&item.sku).map(|(_, q)| *q).unwrap_or(Quantity::none(delta.unit));
        let next = current.plus(delta)?;
        for listener in &self.listeners {
            listener(&item, delta);
        }
        self.stock.insert(item.sku.clone(), (item, next));
        Ok(next)
    }

    fn on_hand(&self) -> Vec<(Item, Quantity)> {
        self.stock.values().cloned().collect()
    }
}
