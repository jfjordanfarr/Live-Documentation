mod analytics;
mod io;
mod metrics;
mod models;

use analytics::run_analysis;
use io::load_series;

fn main() {
    let samples = load_series("baseline");
    let summary = run_analysis(samples);

    if summary.alert {
        println!("alert:{}", summary.label);
    } else {
        println!("ok:{}", summary.label);
    }
}
