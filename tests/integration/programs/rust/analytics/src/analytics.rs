use crate::metrics::{is_alert, summarize};
use crate::models::{Sample, Summary};

pub fn run_analysis(samples: Vec<Sample>) -> Summary {
    let mut summary = summarize(&samples);
    summary.alert = is_alert(&summary);
    summary
}
