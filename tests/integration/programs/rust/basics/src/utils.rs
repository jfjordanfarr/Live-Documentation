pub fn is_even(value: i32) -> bool {
    value % 2 == 0
}

pub fn clamp(value: i32, min: i32, max: i32) -> i32 {
    if value < min {
        return min;
    }
    if value > max {
        return max;
    }
    value
}
