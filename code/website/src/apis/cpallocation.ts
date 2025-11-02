import { courseAPI, type Course } from "./db/course";
import {
	programRequirementAPI,
	type ProgramRequirement,
} from "./db/program_requirement";
import { planAPI } from "./plan";
import { plannerAPI } from "./planner";
import { programAPI } from "./db/program";
import { RecordId } from "surrealdb";

function flattenProgram(
	program: RecordId<string>[][] | undefined,
): ProgramRequirement[] {
	let flattenedReqs: ProgramRequirement[] = [];
	if (program) {
		for (const a in program) {
			if (Array.isArray(program[a])) {
				flattenedReqs = flattenedReqs.concat(flattenProgram(program[a]));
			} else {
				flattenedReqs.push(program[a]);
			}
		}
	}
	return flattenedReqs;
}

function flattenSubReqs(req: ProgramRequirement): ProgramRequirement[] {
	let returner: ProgramRequirement[] = [req];
	let subreqs: ProgramRequirement[] = [];
	for (const subreq in req.sub_requirements) {
		for (const a in programRequirementAPI.getAll()) {
			if (
				programRequirementAPI.getAll()[a].id.id ===
				req.sub_requirements[subreq].id
			) {
				returner.push(programRequirementAPI.getAll()[a]);
				subreqs.push(programRequirementAPI.getAll()[a]);
			}
		}
	}
	for (const a in subreqs) {
		if (a.sub_requirements) {
			returner = returner.concat(flattenSubReqs(a));
		}
	}
	return returner;
}

const priorities = {
	0: ["core"],
	1: ["major", "extmaj", "nomaj"],
	2: ["breadth"],
	3: ["gen-elec"],
};

export const cpAPI = {
	getCourseAssignments() {
		// Getting an ordered list of program requirements

		let allCourseReqs = programRequirementAPI.getAll();
		let program = programAPI.getCurrent()?.program_requirements;
		let flattenedProgram = flattenProgram(program);
		let currentReqs = planAPI.getCurrent().topLevelReqsSelected;
		flattenedProgram = flattenedProgram.filter((req) => {
			for (const a in currentReqs) {
				if (currentReqs[a] === req.id) {
					return true;
				}
			}
			return false;
		});
		allCourseReqs = allCourseReqs?.filter((req) => {
			for (const a in flattenedProgram) {
				if (req.id.id === flattenedProgram[a].id) {
					return true;
				}
			}
			return false;
		});
		let filteredReqs = {};
		let counter = 0;
		for (const a in priorities) {
			for (const b in allCourseReqs) {
				if (priorities[a].includes(allCourseReqs[b].type)) {
					filteredReqs[counter] = allCourseReqs[b];
					counter += 1;
				}
			}
		}

		// Establishing dicts of results

		let flattenedCourses: Course[] = [];
		for (const a in planAPI.getCurrent().planner) {
			for (const b in planAPI.getCurrent().planner[a]) {
				if (planAPI.getCurrent().planner[a][b]) {
					const cCode = courseAPI.code(planAPI.getCurrent().planner[a][b]);
					const cInfo = courseAPI.get(cCode);
					flattenedCourses.push(cInfo);
				}
			}
		}
		let levelReqs = {};
		for (const a in filteredReqs) {
			let InnerDict = {};
			// Getting info from subrequirements
			let requiredCp = 0;
			let achievedCp = 0;
			let courses_included: Course[] = []
			let arrayRemoval: number[] = [];
			if (filteredReqs[a].sub_requirements) {
				const flattenedSubReqs = flattenSubReqs(filteredReqs[a]);
				for (const b in flattenedSubReqs) {
					if (flattenedSubReqs[b]?.required_cp) {
						requiredCp += flattenedSubReqs[b].required_cp;
						const innerReqCp = flattenedSubReqs[b].required_cp;
						let innerAchCp = 0;
						for (const course in flattenedCourses) {
							for (const c in flattenedSubReqs[b].course_options) {
								if (
									Object.values(flattenedSubReqs[b].course_options[c]).some(
										(innerDict) =>
											innerDict.id &&
											innerDict.id === flattenedCourses[course]?.id.id,
									)
								) {
									if (innerReqCp > innerAchCp) {
										achievedCp += flattenedCourses[course]?.cp;
										innerAchCp += flattenedCourses[course]?.cp;
										arrayRemoval.push(course);
										courses_included.push(flattenedCourses[course]);
									}
								}
							}
						}
						levelReqs[flattenedSubReqs[b].id.id] = {
							required_cp: innerReqCp,
							achieved_cp: innerAchCp,
						};
					}
				}
			} else {
				requiredCp = filteredReqs[a].required_cp;
				for (const course in flattenedCourses) {
					for (const b in filteredReqs[a].course_options) {
						if (
							Object.values(filteredReqs[a].course_options[b]).some(
								(innerDict) =>
									innerDict.id &&
									innerDict.id === flattenedCourses[course]?.id.id,
							)
						) {
							if ((requiredCp > achievedCp) && !(requiredCp === 0)) {
								achievedCp += flattenedCourses[course]?.cp;
								arrayRemoval.push(course);
								courses_included.push(flattenedCourses[course]);
							} else if (requiredCp === 0) {
								achievedCp += flattenedCourses[course]?.cp;
								arrayRemoval.push(course);
								courses_included.push(flattenedCourses[course]);
							}
						}
					}
				}
			}
			if (arrayRemoval) {
				for (const a in arrayRemoval) {
					flattenedCourses.splice(arrayRemoval[arrayRemoval.length -  (a + 1)], 1);
				}
			}
			InnerDict["required_cp"] = requiredCp;
			InnerDict["achieved_cp"] = achievedCp;
			InnerDict["courses"] = courses_included;
			levelReqs[filteredReqs[a].id.id] = InnerDict;
		}
		return levelReqs;
	},
	getHighestOrderLevel(course: Course) {
		let allCourseReqs = programRequirementAPI.getAll();
		let program = programAPI.getCurrent()?.program_requirements;
		let flattenedProgram = flattenProgram(program);
		let currentReqs = planAPI.getCurrent().topLevelReqsSelected;
		flattenedProgram = flattenedProgram.filter((req) => {
			for (const a in currentReqs) {
				if (currentReqs[a] === req.id) {
					return true;
				}
			}
			return false;
		});
		allCourseReqs = allCourseReqs?.filter((req) => {
			for (const a in flattenedProgram) {
				if (req.id.id === flattenedProgram[a].id) {
					return true;
				}
			}
			return false;
		});
		let filteredReqs = {};
		let counter = 0;
		for (const a in priorities) {
			for (const b in allCourseReqs) {
				if (priorities[a].includes(allCourseReqs[b].type)) {
					filteredReqs[counter] = allCourseReqs[b];
					counter += 1;
				}
			}
		}
		const currentCondition = this.getCourseAssignments();
		for (const a in filteredReqs) {
			if (((currentCondition[filteredReqs[a].id.id].required_cp > 
				currentCondition[filteredReqs[a].id.id].achieved_cp) && 
				!(currentCondition[filteredReqs[a].id.id].required_cp === 0)) || 
				(currentCondition[filteredReqs[a].id.id].required_cp === 0)) {
				if (filteredReqs[a].sub_requirements) {
					const flattenedSubReqs = flattenSubReqs(filteredReqs[a]);
					for (const b in flattenedSubReqs) {
						if (flattenedSubReqs[b]?.course_options) {
							if (((flattenedSubReqs[b].required_cp > 0 &&
								currentCondition[flattenedSubReqs[b].id.id].achieved_cp) &&
								!(currentCondition[flattenedSubReqs[b].id.id].required_cp === 0)) ||
								(currentCondition[flattenedSubReqs[b].id.id].required_cp === 0)) {
								for (const c in flattenedSubReqs[b].course_options){
									for (const d in flattenedSubReqs[b].course_options[c]) {
										if (flattenedSubReqs[b].course_options[c][d].id === (course.id.id)) {
											return filteredReqs[a];
										}
									}
								}
							}
						}
					}
				} else {
					for (const b in filteredReqs[a].course_options) {
						console.log(filteredReqs[a].course_options[b])
						console.log(course.id.id)
						for (const c in filteredReqs[a].course_options[b]) {
							if (filteredReqs[a].course_options[b][c].id === (course.id.id)) {
								return filteredReqs[a];
							}
						}
					}
				}
			}
		}
		return false;
	}
};
