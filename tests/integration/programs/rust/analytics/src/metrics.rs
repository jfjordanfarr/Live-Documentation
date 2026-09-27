use crate::models::{Sample, Summary};

/// Computes aggregate statistics for a batch of samples.
///
/// Provides the calling code with the average value plus the label of the
/// first sample, mirroring the summarization logic inside the analytics
/// fixture.
///
/// # Arguments
/// - `samples`: Collection of readings whose values will be aggregated.
///
/// # Returns
/// A [`Summary`] populated with the mean value and a best-effort label.
///
/// # Panics
/// Panics when an empty slice is provided and `.first()` is unreachable.
///
/// # Examples
/// ```rust
/// use analytics::metrics;
/// use analytics::models::{Sample, Summary};
///
/// let samples = vec![Sample { label: "sensor-a".into(), value: 10.0 }];
/// let summary: Summary = metrics::summarize(&samples);
/// assert_eq!(summary.label, "sensor-a");
/// ```
pub fn summarize(samples: &[Sample]) -> Summary {
    let total: f64 = samples.iter().map(|sample| sample.value).sum();
    let count = samples.len().max(1) as f64;
    let average = total / count;

    Summary {
        label: samples
            .first()
            .map(|sample| sample.label.clone())
            .unwrap_or_else(|| "unknown".to_owned()),
        average,
        alert: false,
    }
}

/// Flags summaries whose average exceeds the alert threshold.
///
/// # Arguments
/// - `summary`: Result from [`summarize`] that will be evaluated.
///
/// # Returns
/// `true` when the average is above `50.0`, otherwise `false`.
pub fn is_alert(summary: &Summary) -> bool {
    summary.average > 50.0
}
