use tendril::TendrilSink as _;

use crate::{
	db::Course,
	prelude::*,
	scraper::{
		CourseCode,
		html::{self, NodeData},
	},
};

impl CourseCode {
	pub fn url(&self) -> Url {
		Url::parse(&format!(
			"https://programs-courses.uq.edu.au/course.html?course_code={}",
			self,
		))
		.unwrap()
	}
}

pub async fn scrape_course(course: CourseCode) -> color_eyre::Result<Course> {
	let url = course.url();

	let client = reqwest::Client::new();
	let res = client
		.get(url)
		.header("Accept", "text/html")
		.send()
		.await?
		.text()
		.await?;

	{
		// save to file
		let path = Utf8PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/course.html"));
		fs::write(path, &res).await?;
	}

	let dom = html5ever::parse_document(html::RcDom::default(), html5ever::ParseOpts::default())
		.from_utf8()
		.read_from(&mut res.as_bytes())
		.wrap_err("Couldn't parse")?;

	let info_panel = dom.descendants(dom.document.clone()).filter(|child| {
		if let NodeData::Element { name, attrs, .. } = &child.data {
			if &name.local == "div" {
				let class = attrs
					.borrow()
					.iter()
					.find(|attr| &attr.name.local == "class");
				if let Some(class) = class {
					if class.value == ""
				}
			}
		}
		false
	});

	todo!()
}
