//! Where stock is kept.

pub mod memory;

use crate::stock::{Item, Quantity};

/// Where stock is kept.
pub trait Inventory {
    /// Adds stock of an item and returns what is on hand afterwards.
    fn receive(&mut self, item: Item, delta: Quantity) -> Result<Quantity, String>;
    /// Everything on hand, by SKU.
    fn on_hand(&self) -> Vec<(Item, Quantity)>;
}

/// Told about every movement of stock.
pub type Listener = Box<dyn Fn(&Item, Quantity)>;
