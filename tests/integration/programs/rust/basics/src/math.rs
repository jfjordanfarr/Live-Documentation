use crate::utils;

pub fn sum(values: &[i32]) -> i32 {
    values.iter().copied().reduce(|acc, item| acc + item).unwrap_or(0)
}

pub fn describe(values: &[i32]) -> String {
    let total = sum(values);
    let parity = if utils::is_even(total) { "even" } else { "odd" };
    format!("total={} ({})", total, parity)
}
