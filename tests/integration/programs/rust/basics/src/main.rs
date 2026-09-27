mod math;
mod utils;

fn main() {
    let input = vec![1, 3, 5, 7];
    let total = math::sum(&input);
    if utils::is_even(total) {
        println!("total={} is even", total);
    } else {
        println!("total={} is odd", total);
    }
}
