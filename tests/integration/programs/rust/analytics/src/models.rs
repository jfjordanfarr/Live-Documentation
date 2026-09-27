#[derive(Clone)]
pub struct Sample {
    pub label: String,
    pub value: f64,
}

pub struct Summary {
    pub label: String,
    pub average: f64,
    pub alert: bool,
}
