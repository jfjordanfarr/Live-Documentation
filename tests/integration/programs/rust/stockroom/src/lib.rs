//! A small stock-keeping crate.

pub mod report;
pub mod stock;
pub mod store;

pub use stock::Item;
pub use store::memory::Memory;
