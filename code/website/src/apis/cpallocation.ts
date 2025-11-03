import { courseAPI, type Course } from "./db/course";
import {
	programRequirementAPI,
	type ProgramRequirement,
} from "./db/program_requirement";
import { planAPI } from "./plan";
import { plannerAPI } from "./planner";
import { programAPI } from "./db/program";
import { RecordId } from "surrealdb";
import { extractIdentifiers } from "vue/compiler-sfc";

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

const scalable = {
	"core": 0,
	"major": 0,
	"extmaj": 0,
	"nomaj": 1,
	"breadth": 2,
	"gen-elec": 2,
};

function getFilteredReqs() {
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
	return filteredReqs;
}

export const cpAPI = {
	getCourseAssignments() {
		let filteredReqs = getFilteredReqs();

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
		let totalCp = 0;
		for (const a in filteredReqs) {
			let InnerDict = {};
			// Getting info from subrequirements
			let requiredCp = 0;
			let achievedCp = 0;
			let maxCp = 0;
			let courses_included: Course[] = []
			let arrayRemoval: number[] = [];
			if (filteredReqs[a].sub_requirements) {
				requiredCp = filteredReqs[a].cp['required'];
				maxCp = filteredReqs[a].cp['max'];
				const flattenedSubReqs = flattenSubReqs(filteredReqs[a]);
				for (const b in flattenedSubReqs) {
					if (flattenedSubReqs[b]?.cp['required']) {
						const innerReqCp = flattenedSubReqs[b].cp['required'];
						const innerMaxCp = flattenedSubReqs[b].cp['max'];
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
									if (innerMaxCp > innerAchCp) {
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
							max_cp: innerMaxCp,
						};
					}
				}
			} else {
				requiredCp = filteredReqs[a].cp['required'];
				maxCp = filteredReqs[a].cp['max'];
				for (const course in flattenedCourses) {
					for (const b in filteredReqs[a].course_options) {
						if (
							Object.values(filteredReqs[a].course_options[b]).some(
								(innerDict) =>
									innerDict.id &&
									innerDict.id === flattenedCourses[course]?.id.id,
							)
						) {
							if ((maxCp > achievedCp) && !(requiredCp === 0)) {
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
			arrayRemoval = arrayRemoval.sort((a, b) => a - b);
			if (arrayRemoval) {
				for (const a in arrayRemoval) {
					flattenedCourses.splice(arrayRemoval[arrayRemoval.length -  (Number(a) + 1)], 1);
				}
			}
			totalCp += achievedCp
			InnerDict["required_cp"] = requiredCp;
			InnerDict["achieved_cp"] = achievedCp;
			InnerDict['max_cp'] = maxCp;
			InnerDict["courses"] = courses_included;
			levelReqs[filteredReqs[a].id.id] = InnerDict;
		}
		let extraCp = 0;
		for (const req in levelReqs) {
			for (const reqtwo in scalable) {
				if (scalable[reqtwo] === 2) {
					if (req.includes(reqtwo)) {
						extraCp += levelReqs[req].achieved_cp;
					}
				}
			}
		}
		for (const req in levelReqs) {
			for (const reqtwo in scalable) {
				if (scalable[reqtwo] === 1) {
					const reqSliced = req.split('-'	)
					const reqTwoSliced = reqtwo.split('-')
					if (req.includes(reqtwo) && reqSliced.length === (reqTwoSliced.length + 1)) {
						levelReqs[req].max_cp -= extraCp;
					}
				}
			}
		}
		for (const req in filteredReqs) {
			if (filteredReqs[req].sub_requirements) {
				const mainMaxCp = levelReqs[filteredReqs[req].id.id].max_cp;
				const flattenedSubReqs = flattenSubReqs(filteredReqs[req]).filter((requirement) => {
					if (requirement === filteredReqs[req]) {
						return false;
					}
					return true;
				});
				for (const reqtwo in flattenedSubReqs) {
					let adjuctedCp = mainMaxCp;
					for (const reqthree in flattenedSubReqs) {
						if (!(flattenedSubReqs[reqtwo] === flattenedSubReqs[reqthree])) {
							if (levelReqs[flattenedSubReqs[reqthree]?.id.id].required_cp < levelReqs[flattenedSubReqs[reqthree]?.id.id].achieved_cp) {
								adjuctedCp -= levelReqs[flattenedSubReqs[reqthree]?.id.id].achieved_cp;
							} else {
								adjuctedCp -= levelReqs[flattenedSubReqs[reqthree]?.id.id].required_cp;
							}
						}
					}
					if (adjuctedCp < levelReqs[flattenedSubReqs[reqtwo]?.id.id].max_cp) {
						levelReqs[flattenedSubReqs[reqtwo]?.id.id].max_cp = adjuctedCp
					}
				}
			}
		}
		for (const req in levelReqs) {
			for (const reqtwo in scalable) {
				if (req.includes(reqtwo)) {
					if (scalable[reqtwo] === 2) {
						let greatestCp = programAPI.getCurrent().required_cp
						for (const reqthree in levelReqs) {
							let is_superreq = false;
							for (const reqfour in levelReqs) {
								if ((reqfour.includes(reqthree)) && !(reqfour === reqthree)) {
									is_superreq = true;
								}
							}
							if (!(req === reqthree) && !is_superreq) {
								if (levelReqs[reqthree].required_cp < levelReqs[reqthree].achieved_cp) {
									 greatestCp -= levelReqs[reqthree].achieved_cp;
								} else {
									 greatestCp -= levelReqs[reqthree].required_cp;
								}
							}
						}
						levelReqs[req].max_cp = greatestCp
					}
				}
			}
		}
		return [levelReqs, totalCp];
	},
	getHighestOrderLevel(course: Course) {
		let filteredReqs = getFilteredReqs();
		const currentCondition = this.getCourseAssignments()[0];
		for (const a in filteredReqs) {
			if (((currentCondition[filteredReqs[a].id.id].max_cp > 
				currentCondition[filteredReqs[a].id.id].achieved_cp) && 
				!(currentCondition[filteredReqs[a].id.id].required_cp === 0)) || 
				(currentCondition[filteredReqs[a].id.id].required_cp === 0)) {
				if (filteredReqs[a].sub_requirements) {
					const flattenedSubReqs = flattenSubReqs(filteredReqs[a]);
					for (const b in flattenedSubReqs) {
						if (flattenedSubReqs[b]?.course_options) {
							if (((flattenedSubReqs[b].cp['max'] > 0 &&
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
