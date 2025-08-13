use ystd::prelude::*;

#[path = "tracing.rs"]
mod app_tracing;

#[tokio::main]
async fn main() -> color_eyre::Result<()> {
	app_tracing::install_tracing("info,comp1100=trace")?;
	trace!("Installed tracing for comp1100");

	comp1100::scraper::wip_get_course_json(comp1100::scraper::Bachelor::Maths).await?;

	Ok(())
}
