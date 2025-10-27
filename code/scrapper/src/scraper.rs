use std::{collections::HashSet, rc::Rc};

use html5ever::interface::TreeSink;
use regex::Regex;
use tendril::TendrilSink;

pub mod course;
mod html;

use crate::{prelude::*, scraper::html::NodeData};

/// e.g. COMP1100
#[derive(Debug, PartialEq, Eq, Hash)]
pub struct CourseCode(Rc<str>);

impl std::fmt::Display for CourseCode {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(f, "{}", self.0)
	}
}

impl CourseCode {
	pub fn new(str: &str) -> color_eyre::Result<CourseCode> {
		if str.len() != 8 {
			bail!("Course '{}' has wrong string length", str)
		}
		return Ok(CourseCode(Rc::from(str.to_uppercase())));
	}
}

#[derive(Default, Debug)]
pub struct CourseCodeCollection(pub HashSet<CourseCode>);

#[derive(Clone, Copy, Debug, strum::EnumIter)]
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
	pub async fn get_related_courses(&self) -> color_eyre::Result<Vec<CourseCode>> {
		todo!()
	}
}

pub async fn append_relevant_courses(
	collection: &mut CourseCodeCollection,
	num: Bachelor,
) -> color_eyre::Result<()> {
	let url = num.url();
	info!("Searching a url: {}", url);
	let res = reqwest::get(url).await?.text().await?;

	{
		// save to file
		let path = Utf8PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/maths.html"));
		fs::write(path, &res).await?;
	}

	let dom = html5ever::parse_document(html::RcDom::default(), html5ever::ParseOpts::default())
		.from_utf8()
		.read_from(&mut res.as_bytes())
		.wrap_err("Couldn't parse")?;

	let script = dom
		.descendants(dom.document.clone())
		.filter(|child| {
			if let NodeData::Element { name, .. } = &child.data {
				// trace!("Node is a child: {:?}", name);
				if &name.local == "script" {
					return true;
				}
			}
			false
		})
		.filter_map(|script| {
			let node = script.children.borrow();
			let node = node.get(0)?;
			let NodeData::Text { contents } = &node.data else {
				return None;
			};
			let str = contents.borrow();
			Some(str.to_owned())
		})
		.find(|str| str.len() > 500)
		.ok_or(eyre!("Couldn't find appropriate script tag"))?;

	debug!(
		"Found the script text which is {} characters long",
		script.len()
	);

	let (preamble, json) = script.split_once('=').ok_or(eyre!("No = found"))?;
	// remove the trailing ;
	let json = json.trim().trim_end_matches(";");
	debug!("First part of the string: {}", preamble);

	let json: serde_json::Value = serde_json::from_str(json)?;

	info!("{:#?}", json);
	{
		// save to file
		let path = Utf8PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/maths.json"));
		fs::write(path, serde_json::to_string_pretty(&json)?).await?;
	}

	let re = Regex::new("\"([A-Z]{4}\\d{4})\"")?;
	let json = json.to_string();

	let codes: Vec<&str> = re
		.find_iter(&json)
		.map(|m| m.as_str())
		.map(|str| &str[1..=8])
		.collect();
	let course_codes: Vec<CourseCode> = codes
		.iter()
		.map(|code| CourseCode::new(code))
		.collect::<Result<_, _>>()?;

	for code in course_codes {
		collection.0.insert(code);
	}

	Ok(())
}

struct DepthFirstDescendants {
	// root: html::Handle,
	this_layer: std::vec::IntoIter<html::Handle>,
	depth: Option<Box<DepthFirstDescendants>>,
}

impl DepthFirstDescendants {
	fn new(root: html::Handle) -> Self {
		Self {
			this_layer: root.children.borrow().to_owned().into_iter(),
			depth: None,
		}
	}
}

impl Iterator for DepthFirstDescendants {
	type Item = html::Handle;

	fn next(&mut self) -> Option<Self::Item> {
		match self.depth {
			None => {
				// first off this_layer
				let next = self.this_layer.next()?;
				self.depth = Some(Box::new(DepthFirstDescendants::new(next.clone())));
				return Some(next);
			}
			Some(ref mut depth) => match depth.next() {
				Some(next) => Some(next),
				None => {
					self.depth = None;
					self.next()
				}
			},
		}
	}
}

impl html::RcDom {
	fn descendants(&self, root: html::Handle) -> DepthFirstDescendants {
		DepthFirstDescendants::new(root)
	}

	fn find<CB>(&self, from: html::Handle, cb: &mut CB) -> Option<html::Handle>
	where
		CB: FnMut(html::Handle) -> bool,
	{
		// try finding
		for child in &*from.children.borrow() {
			if cb(child.clone()) {
				return Some(child.clone());
			}
		}

		// try each recursively
		for child in &*from.children.borrow() {
			if let Some(handle) = self.find(child.clone(), cb) {
				return Some(handle);
			}
		}

		// else None
		None
	}
}
