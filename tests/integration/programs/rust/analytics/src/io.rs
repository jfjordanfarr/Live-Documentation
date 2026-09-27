use crate::models::Sample;

pub fn load_series(label: &str) -> Vec<Sample> {
    match label {
        "baseline" => vec![
            Sample { label: "baseline".to_owned(), value: 42.0 },
            Sample { label: "baseline".to_owned(), value: 28.0 },
            Sample { label: "baseline".to_owned(), value: 63.0 },
        ],
        "spiky" => vec![
            Sample { label: "spiky".to_owned(), value: 5.0 },
            Sample { label: "spiky".to_owned(), value: 80.0 },
            Sample { label: "spiky".to_owned(), value: 12.0 },
        ],
        _ => vec![Sample { label: label.to_owned(), value: 10.0 }],
    }
}
