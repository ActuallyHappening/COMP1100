import type { RecordId, RecordIdValue } from "surrealdb";
import { assert_id } from "./db";
import { courseAPI, type Course, type Prereq } from "./db/course";
import { toast } from "vue3-toastify";

export const sem_ids = [
	"2025 Sem 1",
	"2025 Sem 2",
	"2026 Sem 1",
	"2026 Sem 2",
	"2027 Sem 1",
	"2027 Sem 2",
] as const;

export type SemId = (typeof sem_ids)[number];

export const defaultPlanner = (): Planner => {
	const ret = {} as Planner;
	for (const sem_id of sem_ids) {
		ret[sem_id] = [undefined, undefined, undefined, undefined];
	}
	return ret;
};

/** Future idea: First two slots are core, and second and third for electives? */
export const slots = ["Course 1", "Course 2", "Course 3", "Course 4"] as const;

/** Lowercase */
export type SemPlan = [
	string | undefined,
	string | undefined,
	string | undefined,
	string | undefined,
];
export type Planner = {
	[key in SemId]: SemPlan;
};

/** Does mutate original, assumes it is a Vue proxy */
export const plannerAPI = (planner: Planner) =>
	({
		assertSemId(sem_id: SemId) {
			if (sem_ids.indexOf(sem_id) === -1) {
				throw new TypeError(`${sem_id} not valid`);
			}
		},
		getSemPlan(sem_id: SemId): Planner[SemId] {
			this.assertSemId(sem_id);

			if (!planner[sem_id]) {
				planner[sem_id] = defaultPlanner()[sem_id];
			}
			if (planner[sem_id].length !== defaultPlanner()[sem_id].length) {
				planner[sem_id] = defaultPlanner()[sem_id];
			}
			return planner[sem_id];
		},
		getIndex([sem_id, index]: [SemId, number]) {
			this.assertSemId(sem_id);
			if (typeof index !== "number") {
				throw new TypeError();
			}
			return this.getSemPlan(sem_id)[index];
		},
		getIndexOfCourse(course: RecordId<string>): [SemId, number] | undefined {
			assert_id(course);
			for (const _sem_id in planner) {
				const sem_id = _sem_id as SemId;
				const index = this.getSemPlan(sem_id).indexOf(course.id.toString());
				// console.info(
				// 	`REMOVEME get indx of`,
				// 	index,
				// 	sem_id,
				// 	course.id.toString(),
				// );
				if (index !== -1) {
					return [sem_id, index];
				}
			}
			return undefined;
		},
		removeCourse(course: RecordId<string>) {
			const index = this.getIndexOfCourse(course);
			if (index) {
				const [sem_id, i] = index;
				this.getIndex([sem_id, i]);
				planner[sem_id][i] = undefined;
			}
		},
		/** Doesn't include sem_id */
		semIdsBefore(sem_id: SemId): SemId[] {
			this.assertSemId(sem_id);

			const index = sem_ids.indexOf(sem_id);
			const ret = sem_ids.slice(0, index);
			if (ret.indexOf(sem_id) !== -1) {
				throw new Error();
			}
			return ret;
		},
		/** All courses completed in the previous semester */
		previousCoursesTo(sem_id: SemId, thisCourse: RecordId<string>): Course[] {
			const codes = new Set<string>([]);
			// previous sem_ids
			for (const prev_sem_id of this.semIdsBefore(sem_id)) {
				this.getSemPlan(prev_sem_id).forEach((code) => {
					if (code) {
						codes.add(code);
					}
				});
			}
			// won't include itself
			codes.delete(thisCourse.id.toString());

			// console.log(
			// 	`REMOVEME DEBUG`,
			// 	`previousCoursesTo(${sem_id}, ${thisCourse.id}) =`,
			// 	codes,
			// );
			return [...codes].map((code) => getCourse(code));
		},
		assignNewCourse([sem_id, index]: [SemId, number], id: RecordId<string>) {
			assert_id(id);
			// declaration of variables for checking incompatibilities, sems
			var thisCourse = courseAPI.getCourseOrErr(id);
			// declaration of variables from here only needed for sems
			var relevantSemId = sem_id.split(" ").slice(1).join(" ");
			var thisCourseSems = {
				"Sem 1": thisCourse.sem_1,
				"Sem 2": thisCourse.sem_2,
				"Sem summer": thisCourse.sem_summer,
			};
			// pre-existing code for checking if the course already placed in
			if (this.getIndexOfCourse(id)) {
				toast(`Not adding course ${id.id} which is already in your plan`, {
					type: "info",
				});
				return;
			}
			// iterating through incompatibilities, return a message if required
			for (const inc of thisCourse.incompatible) {
				if (this.getIndexOfCourse(inc)) {
					toast(`Not adding course ${id.id} due to incompatibilities`, {
						type: "info",
					});
					return;
				}
			}
			// checking if sem selected is possible in dict
			if (!thisCourseSems[relevantSemId]) {
				toast(
					`Not adding course ${id.id} due to not being offered in selected semester`,
					{
						type: "info",
					},
				);
				return;
			}
			// that's all from me on checking incompatibilities, sems. Toodles!
			this.getIndex([sem_id, index]);
			console.info(`Assigning`, sem_id, id, `to`, id.id);
			planner[sem_id][index] = id.id.toString();
		},
		prereqCheck({
			previousCourses,
			thisCourse,
		}: {
			previousCourses: Course[];
			thisCourse: Course;
		}): boolean {
			// [ course:csse1001, "AND", ...]
			const thisPrereqs: Prereq = thisCourse.prerequisites;
			// "comp1100"
			const thisCode = thisCourse.id.id;
			// [ "infs1200", "comp2048", ...]
			const previouslyDone = previousCourses.map((course) => course.id.id);
			// var previousCourses is a dictionary of previously completed courses (full DB return)
			// var thisCourse is the course currently selected (full DB return)
			// var thisPrereqs is the prerequisites field of thisCourse (as found in DB)
			// var thisCode is the course code of thisCourse (string)
			// var previouslyDone is an array of course codes previously completed (strings)

			// recursive comlicated algorithm, probably using
			// eval();
			// Unpacking prereqs recursively --> must include nesting check
			var currentPrereqState = true;
			const evaluatePrereq = (
				prereq: Array<RecordId<string> | Prereq | "AND" | "OR" | undefined>,
				previouslyDone: Array<RecordIdValue>,
			): boolean => {
				if ((prereq.length = 1 && !Array.isArray(prereq[0]))) {
					return previouslyDone.includes(prereq[0].id);
				} else {
					var firstCourse = prereq[0];
					if (!Array.isArray(firstCourse)) {
						firstCourse = [firstCourse];
					}
					if (prereq[1] === "OR") {
						console.log(
							evaluatePrereq(firstCourse, previouslyDone),
							evaluatePrereq(prereq.slice(2), previouslyDone),
						);
						return (
							evaluatePrereq(firstCourse, previouslyDone) ||
							evaluatePrereq(prereq.slice(2), previouslyDone)
						);
					} else if (prereq[1] === "AND") {
						return (
							evaluatePrereq(firstCourse, previouslyDone) &&
							evaluatePrereq(prereq.slice(2), previouslyDone)
						);
					}
				}
				return true;
			};
			if (thisPrereqs && thisPrereqs[0]) {
				currentPrereqState = evaluatePrereq(thisPrereqs, previouslyDone);
			}
			return currentPrereqState;
		},
	}) as const;
