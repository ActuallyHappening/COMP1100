use html5ever::interface::TreeSink;
use tendril::TendrilSink;

mod html;

use crate::prelude::*;

#[derive(Clone, Copy, Debug)]
pub enum Bachelor {
	MathsCompSci = 2497,
	Maths = 2460,
}

impl Bachelor {
	pub fn code(&self) -> u32 {
		*self as u32
	}

	pub fn url(&self) -> Url {
		Url::parse(&format!(
			"https://programs-courses.uq.edu.au/requirements/program/{}/2026",
			self.code()
		))
		.unwrap()
	}
}

impl Bachelor {
	pub async fn get_related_courses(&self) -> color_eyre::Result<Vec<Course>> {
		todo!()
	}
}

pub struct Course {
	pub code: Box<str>,
	pub name: Box<str>,
}

pub async fn wip_get_course_json(num: Bachelor) -> color_eyre::Result<()> {
	let url = num.url();
	let res = reqwest::get(url).await?.text().await?;

	{
		// save to file
		let path = Utf8PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/maths.html"));
		fs::write(path, &res).await?;
	}

	let res = html5ever::parse_document(html::RcDom::default(), html5ever::ParseOpts::default())
		.from_utf8()
		.read_from(&mut res.as_bytes())
		.wrap_err("Couldn't parse")?;

	for child in &*res.document.children.borrow() {
		info!(?child, "A child is:");
	}

	Ok(())
}
