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