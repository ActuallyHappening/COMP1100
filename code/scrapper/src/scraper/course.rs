use crate::{db::Course, prelude::*, scraper::CourseCode};

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

	let res = reqwest::get(url).await?.text().await?;

	{
		// save to file
		let path = Utf8PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/course.html"));
		fs::write(path, &res).await?;
	}

	todo!()
}
