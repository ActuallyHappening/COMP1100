use serde::{Deserialize, Serialize};
use serde_json::json;
use surrealdb::RecordId;

use crate::scraper::CourseCode;

#[derive(Debug, Clone, Hash, Serialize, Deserialize)]
pub struct CourseId(RecordId);

impl CourseId {
	pub fn new(code: CourseCode) -> CourseId {
		CourseId(RecordId::from_table_key(
			"course",
			code.to_string().to_lowercase(),
		))
	}
}

#[derive(Debug, Clone, Hash)]
pub struct Course {
	id: RecordId,
	name: String,
	description: String,
	sem_1: bool,
	sem_2: bool,
	sem_summer: bool,
	prerequisites: Vec<Prereq>,
	incompatible: Vec<CourseId>,
}

#[derive(Debug, Clone, Hash)]
pub enum Prereq {
	AND,
	OR,
	Course(CourseId),
	Brackets(Vec<Prereq>),
}
impl Prereq {
	fn into_json_values(this: Vec<Prereq>) -> serde_json::Value {
		this.into_iter()
			.map(Prereq::into_json_value)
			.collect::<Vec<serde_json::Value>>()
			.into()
	}
	fn into_json_value(self) -> serde_json::Value {
		match self {
			Self::AND => json!("AND"),
			Self::OR => json!("OR"),
			Self::Course(course) => json!(course),
			Self::Brackets(inner) => json!(Prereq::into_json_values(inner)),
		}
	}
}

impl Course {
	pub fn into_json_value(&self) -> serde_json::Value {
		json!({
			"id": self.id,
			"name": self.name,
			"description": self.description,
			"sem_1": self.sem_1,
			"sem_2": self.sem_2,
			"sem_summer": self.sem_summer,
			"prerequisites": Prereq::into_json_values(self.prerequisites.clone()),
			"incompatible": self.incompatible,
		})
	}
}
