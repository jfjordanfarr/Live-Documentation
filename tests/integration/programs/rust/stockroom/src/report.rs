//! Reports over what an inventory holds.

use crate::stock::*;
use crate::store::Inventory;

/// One line per item on hand, in SKU order.
pub fn write(inventory: &dyn Inventory) -> Vec<String> {
    inventory
        .on_hand()
        .iter()
        .map(|(item, quantity)| item.describe(*quantity))
        .collect()
}

/// Adds up anything countable.
pub fn total<T: Countable>(values: &[T]) -> f64 {
    values.iter().map(Countable::amount).sum()
}

/// How many lines a report has.
pub fn count(lines: &[String]) -> usize {
    lines.len()
}
