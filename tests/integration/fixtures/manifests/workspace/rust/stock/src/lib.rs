/// The count of one item on the shelf.
pub fn on_hand(received: u32, shipped: u32) -> u32 {
    received.saturating_sub(shipped)
}
