//! Items and the quantities they are kept in.

mod item;
mod quantity;

pub use item::Item;
pub use quantity::{Quantity, Unit};

/// Anything a total can be made of.
pub trait Countable {
    /// The amount to add up.
    fn amount(&self) -> f64;
}

impl Countable for Quantity {
    fn amount(&self) -> f64 {
        self.amount
    }
}
