use comp1100::scraper::{Bachelor, CourseCodeCollection};
use strum::IntoEnumIterator;
use ystd::prelude::*;

#[path = "tracing.rs"]
mod app_tracing;

// Hello
#[tokio::main]
async fn main() -> color_eyre::Result<()> {
	app_tracing::install_tracing("info,comp1100=trace")?;
	trace!("Installed tracing for comp1100");

	let mut collection = CourseCodeCollection::default();

	let bachelours = Bachelor::iter();

	for bachelour in bachelours {
		comp1100::scraper::append_relevant_courses(&mut collection, bachelour).await?;
	}

	info!(?collection, "Found courses");

	Ok(())
}
