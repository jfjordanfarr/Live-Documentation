//! Receives two items and prints the report.

use stockroom::report;
use stockroom::stock::{Quantity, Unit};
use stockroom::store::Inventory;
use stockroom::{Item, Memory};

fn main() {
    let mut inventory = Memory::new();
    inventory.listen(Box::new(|item, _delta| println!("moved {}", item.sku)));
    // The words store::Inventory and report::count here are a comment, not references.
    inventory.receive(Item::new("A-1", "Anvil"), Quantity { amount: 2.0, unit: Unit::Each }).unwrap();
    inventory.receive(Item::new("B-2", "Bolts"), Quantity { amount: 1.5, unit: Unit::Kilogram }).unwrap();
    for line in report::write(&inventory) {
        println!("{}", line);
    }
    println!("stock::Item lines: {}", report::write(&inventory).len());
}
