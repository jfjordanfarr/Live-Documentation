use stockroom::report::{count, total, write};
use stockroom::stock::{Item, Quantity, Unit};
use stockroom::store::Inventory;
use stockroom::Memory;

#[test]
fn writes_one_line_per_item_in_sku_order() {
    let mut inventory = Memory::new();
    inventory.receive(Item::new("B-2", "Bolts"), Quantity { amount: 1.5, unit: Unit::Kilogram }).unwrap();
    inventory.receive(Item::new("A-1", "Anvil"), Quantity { amount: 2.0, unit: Unit::Each }).unwrap();
    let lines = write(&inventory);
    assert_eq!(count(&lines), 2);
    assert!(lines[0].starts_with("A-1"));
}

#[test]
fn totals_quantities() {
    let quantities = [Quantity { amount: 1.5, unit: Unit::Each }, Quantity { amount: 2.0, unit: Unit::Each }];
    assert_eq!(total(&quantities), 3.5);
}
