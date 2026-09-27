use super::quantity::Quantity;

/// Something the stockroom keeps, identified by its SKU.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct Item {
    pub sku: String,
    pub name: String,
}

impl Item {
    /// A new item.
    pub fn new(sku: &str, name: &str) -> Self {
        Item { sku: sku.to_string(), name: name.to_string() }
    }

    /// The item as a report line.
    pub fn describe(&self, quantity: Quantity) -> String {
        format!("{}  {}  {:.1} {}", self.sku, self.name, quantity.amount, quantity.label())
    }
}
