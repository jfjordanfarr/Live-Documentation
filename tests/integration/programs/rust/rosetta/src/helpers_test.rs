//! Unit tests for the Helpers module.
//!
//! This test file exercises name-matched test detection:
//! helpers_test.rs should automatically back helpers.rs.

#[cfg(test)]
mod tests {
    use crate::helpers::{format, sum, average};

    #[test]
    fn format_formats_numbers_with_two_decimal_places() {
        assert_eq!(format(100.0), "100.00");
        assert_eq!(format(0.0), "0.00");
    }

    #[test]
    fn sum_sums_slice_of_numbers() {
        let values = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        assert!((sum(&values) - 15.0).abs() < 0.001);

        let values2 = vec![100.0, 200.0, 300.0];
        assert!((sum(&values2) - 600.0).abs() < 0.001);
    }

    #[test]
    fn sum_returns_zero_for_empty_slice() {
        let values: Vec<f64> = vec![];
        assert!((sum(&values) - 0.0).abs() < 0.001);
    }

    #[test]
    fn average_calculates_average_of_numbers() {
        let values = vec![10.0, 20.0, 30.0];
        assert!((average(&values) - 20.0).abs() < 0.001);
    }

    #[test]
    fn average_returns_zero_for_empty_slice() {
        let values: Vec<f64> = vec![];
        assert!((average(&values) - 0.0).abs() < 0.001);
    }
}
