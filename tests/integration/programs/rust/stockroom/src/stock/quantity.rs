/// How a quantity is counted.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Unit {
    Each,
    Kilogram,
}

/// An amount of stock in a unit.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Quantity {
    pub amount: f64,
    pub unit: Unit,
}

impl Quantity {
    /// A quantity of nothing, in the given unit.
    pub fn none(unit: Unit) -> Self {
        Quantity { amount: 0.0, unit }
    }

    /// This quantity plus another of the same unit.
    pub fn plus(self, other: Quantity) -> Result<Quantity, String> {
        if other.unit != self.unit {
            return Err(format!("units differ: {:?} and {:?}", self.unit, other.unit));
        }
        Ok(Quantity { amount: self.amount + other.amount, unit: self.unit })
    }

    pub(crate) fn label(self) -> &'static str {
        match self.unit {
            Unit::Each => "ea",
            Unit::Kilogram => "kg",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn plus_keeps_the_unit() {
        let sum = Quantity { amount: 1.0, unit: Unit::Kilogram }.plus(Quantity { amount: 2.0, unit: Unit::Kilogram });
        assert_eq!(sum, Ok(Quantity { amount: 3.0, unit: Unit::Kilogram }));
    }

    #[test]
    fn plus_rejects_mixed_units() {
        assert!(Quantity::none(Unit::Each).plus(Quantity::none(Unit::Kilogram)).is_err());
    }
}
