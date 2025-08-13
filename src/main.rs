use ystd::prelude::*;

#[path = "tracing.rs"]
mod app_tracing;

fn main() {
	app_tracing::install_tracing("info,comp1100=trace");
	trace!("Installed tracing for comp1100");
}
