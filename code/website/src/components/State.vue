<script lang="ts" setup>
/**
 * This file manages the network and localStorage state
 */

import package_json from "../../package.json";
import { useStorage } from "@vueuse/core";
import { computed, provide, onMounted, ref, reactive, watch } from "vue";
import _ from "lodash";
import * as semver from "semver";
import { toast } from "vue3-toastify";

// const current_version = "0.1.0";
const current_version = package_json.version;
const compatible_versions = `=${current_version}`;
const debug = useStorage("debug", false);

const sem_ids = [
	"2025 Sem 1",
	"2025 Sem 2",
	"2026 Sem 1",
	"2026 Sem 2",
	"2027 Sem 1",
	"2027 Sem 2",
] as const;
export type SemId = (typeof sem_ids)[number];
const defaultPlanner = (): Planner => {
	const ret = {} as Planner;
	for (const sem_id of sem_ids) {
		ret[sem_id] = [undefined, undefined, undefined, undefined];
	}
	return ret;
};
/** Does mutate original, assumes it is a Vue proxy */
const plannerAPI = (planner: Planner) =>
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
		getIndexOfCourse(
			course: RecordId<string>,
		): [SemId, number] | undefined {
			assert_id(course);
			for (const _sem_id in planner) {
				const sem_id = _sem_id as SemId;
				const index = this.getSemPlan(sem_id).indexOf(
					course.id.toString(),
				);
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
		previousCoursesTo(
			sem_id: SemId,
			thisCourse: RecordId<string>,
		): Course[] {
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
		assignNewCourse(
			[sem_id, index]: [SemId, number],
			id: RecordId<string>,
		) {
			assert_id(id);
			// declaration of variables for checking incompatibilities, sems
			var thisCourse = getCourse(id.id.toString());
			// declaration of variables from here only needed for sems
			var relevantSemId = sem_id.split(" ").slice(1).join(" ");
			var thisCourseSems = {
				"Sem 1": thisCourse.sem_1,
				"Sem 2": thisCourse.sem_2,
				"Sem summer": thisCourse.sem_summer,
			};
			// pre-existing code for checking if the course already placed in
			if (this.getIndexOfCourse(id)) {
				toast(
					`Not adding course ${id.id} which is already in your plan`,
					{
						type: "info",
					},
				);
				return;
			}
			// iterating through incompatibilities, return a message if required
			for (const inc of thisCourse.incompatible) {
				if (this.getIndexOfCourse(inc)) {
					toast(
						`Not adding course ${id.id} due to incompatibilities`,
						{
							type: "info",
						},
					);
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
			const previouslyDone = previousCourses.map(
				(course) => course.id.id,
			);
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
				prereq: Array<
					RecordId<string> | Prereq | "AND" | "OR" | undefined
				>,
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
				currentPrereqState = evaluatePrereq(
					thisPrereqs,
					previouslyDone,
				);
			}
			return currentPrereqState;
		},
	}) as const;
export type PlannerAPI = ReturnType<typeof plannerAPI>;

export type PlanState = {
	name: string;
	programId: string | null;
	/**
	 * The program_requirements selected for each required top level slot
	 * in the user's degree, e.g. their major.
	 * Uses string id field for serialization
	 */
	topLevelReqsSelected: { [key: number]: string | undefined };
	planner: Planner;
};
const defaultPlan = (num: number) =>
	_.cloneDeep({
		name: `Plan ${num}`,
		programId: null,
		topLevelReqsSelected: {},
		planner: defaultPlanner(),
	});
const defaultState = {
	version: current_version,
	current: "Plan 1",
	plans: {
		"Plan 1": {
			...defaultPlan(1),
			name: "My first plan",
		},
	},
};

/** Course id (code) lowercase */
const selectedState = ref(undefined as undefined | string);

const _localState = useStorage(
	`student-info`,
	reactive(_.cloneDeep(defaultState)),
);
// export const localState = computed(() => _localState ?? defaultState);
const localState = _localState;
const reset = () => {
	console.warn(`Resetting all local state`);
	localState.value = _.cloneDeep(defaultState);
};
// Aggressively purge out of date state
watch(
	localState,
	() => {
		if (
			!localState.value.version ||
			!semver.satisfies(localState.value.version, compatible_versions)
		) {
			console.warn(
				`Hard resetting local state because old version ${localState.value.version} doesn't satisfy ${compatible_versions} (currently ${current_version})`,
			);
			toast(
				`Your save has been hard reset because this is still an MVP`,
				{
					type: "warning",
				},
			);
			reset();
		} else {
			console.info(
				`Version of ${localState.value.version} is compatible with the current version ${current_version}`,
			);
		}
	},
	{ deep: true, immediate: true },
);

const getCurrentPlanState = (): PlanState => {
	const ret = localState.value?.plans?.[localState.value.current];
	if (!ret) {
		toast(`Major error, resetting state`, { type: "error" });
		reset();
		return getCurrentPlanState();
	}
	return ret;
};
// every time the program changes, reset the top level req chosen
watch(
	() => getCurrentPlanState().programId,
	(current, old) => {
		console.warn(
			`Resetting topLevelReqsSelected because the programId has changed from ${old} to ${current}`,
		);
		getCurrentPlanState().topLevelReqsSelected = {};
	},
);

export type Program = {
	id: RecordId<string>;
	code: number;
	name: string;
	url: string;
	program_requirements: RecordId<string>[][];
};
export type Prereq = ("OR" | "AND" | RecordId<string> | Prereq)[];
export type Course = {
	id: RecordId<string>;
	code: string;
	cp: number;
	name: string;
	prerequisites: Prereq;
	incompatible: RecordId<string>[];
	sem_1: boolean;
	sem_2: boolean;
	sem_summer: boolean;
};
const error_course = (msg: string): Course => {
	return {
		id: new RecordId("course", `Error: ${msg}`),
		code: msg,
		cp: 2,
		name: msg,
		prerequisites: [],
		incompatible: [],
		sem_1: false,
		sem_2: false,
		sem_summer: false,
	};
};
export type RequirementType =
	| "core"
	| "major"
	| "major-subcomponent"
	| "nomaj"
	| "nomaj-subcomponent"
	| "extmaj"
	| "extmaj-subcomponent"
	| "breadth"
	| "gen-elec";
const requirement_type_to_header = (requirement: RequirementType): string => {
	if (requirement === "core") {
		return "Core";
	} else if (requirement === "major") {
		return "Major";
	} else if (requirement === "nomaj") {
		return "No Major";
	} else if (requirement === "extmaj") {
		return "Extended Major";
	} else if (requirement === "breadth") {
		return "Breadth"
	} else if (requirement === "gen-elec") {
		return "General Elective" 
	}else {
		// Shouldn't hit currently
		return requirement.toUpperCase();
	}
};
const requirement_types_to_header = (
	requirements: RequirementType[],
): string => {
	return [...new Set(requirements)]
		.map((req) => requirement_type_to_header(req))
		.join(" | ");
};
export type ProgramRequirement = {
	id: RecordId<string>;
	name: string;
	type: RequirementType;
	short_name: string | undefined;
	required_cp: number | undefined;
	sub_requirements: RecordId<string>[] | undefined;
	course_options: RecordId<string>[][] | undefined;
};
const assert_id = (id1: RecordId<string> | unknown, msg?: string) => {
	if (!(id1 instanceof RecordId)) {
		throw new TypeError(
			`Not an id (${JSON.stringify(id1)})` + msg ? `: ${msg}` : ``,
		);
	}
};
const getProgramRequirement = (id: RecordId<string>): ProgramRequirement => {
	assert_id(id, `getProgramRequirement`);

	if (!program_requirements.value) {
		const err = new Error(`program_requirements not loaded yet`);
		toast(err.message, { type: "warning" });
		throw err;
	}
	const ret = program_requirements.value.find(
		(req) => req.id.id.toString() === id.id.toString(),
	);
	if (!ret) {
		const error = new Error(`Couldn't getProgramRequirement(${id})`);
		console.error(error);
		toast(error.message, { type: "error" });
		throw error;
	}
	return ret;
};

const programs = ref(null! as Program[]);
const courses = ref(null! as Course[]);
const program_requirements = ref(null! as ProgramRequirement[]);
// const programs = useStorage("db-programs", null! as Program[]);
// const courses = useStorage("db-courses", null! as Course[]);
// const program_requirements = useStorage(
// 	"db-program_requirement",
// 	null! as ProgramRequirement[],
// );

function getCurrentProgram(): Program | undefined {
	const planState = getCurrentPlanState();
	const ret = programs.value.find(
		(program) => program.id.toString() === planState.programId,
	);
	if (!ret) {
		// haven't selected program yet
		return undefined;
		// const err = new Error(
		// 	`getCurrentProgram(${planState.programId}) returned undefined`,
		// );
		// toast(err.message, { type: "error" });
		// throw err;
	}
	return ret;
}

function getCourse(code: string, options: { allowUnknown: boolean }): Course {
	if (!code) {
		throw new TypeError(code);
	}
	return courses.value.find(
		(course) => course.code.toUpperCase() == code.toUpperCase(),
	);
}

import { RecordId, Surreal, Table, type RecordIdValue } from "surrealdb";
import type { Planner } from "./PlannerVisuals.vue";
import { router } from "../routes";

function refresh() {
	const db = new Surreal();
	return Promise.resolve()
		.then(() => {
			return db.connect(
				"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
				{
					namespace: "comp1100",
					database: "master",
					// guest auth
				},
			);
		})
		.then(() =>
			Promise.all([
				db
					.select(new Table("program"))
					.then((data) => (programs.value = data as any)),
				db
					.select(new Table("course"))
					.then((data) => (courses.value = data as any)),
				db
					.select(new Table("program_requirement"))
					.then((data) => (program_requirements.value = data as any)),
			]),
		)
		.catch((err) => {
			const error = new Error(`Failed to load data from the database`, {
				cause: err,
			});
			console.error(error);
			toast(error.message, { type: "error" });
		})
		.then(() => {
			console.info(`Successfully loaded all information from the db:`);
			console.info(`programs`, _.cloneDeep(programs.value));
			console.info(`courses`, _.cloneDeep(courses.value));
			console.info(
				`program_requirement`,
				_.cloneDeep(program_requirements.value),
			);
		});
}

onMounted(() => refresh());

console.log(programs, courses);

// export const STATE = Symbol("App level state");
const provided_export = {
	debug,
	localState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
	defaultPlanner,
	plannerAPI,
	courses,
	getCourse,
	program_requirements,
	getProgramRequirement,
	refresh,
	sem_ids,
	selectedState,
	error_course,
	requirement_types_to_header,
	requirement_type_to_header,
};
export type ProvidedExport = typeof provided_export;
provide("state", provided_export);

const fullyLoaded = () => {
	return (
		!!localState.value?.plans?.[localState.value.current] &&
		!!programs.value &&
		!!courses.value &&
		!!program_requirements.value
	);
};

//** Routing **
/** Doesn't really change any behaviour yet */
watch(
	() => getCurrentPlanState().name,
	(current) => {
		if (typeof current === "string" && current !== "") {
			router.push({ name: `plan`, params: { id: current } });
		}
	},
	{ deep: true, immediate: true },
);
// hash <-> selectedState
watch(
	() => router.currentRoute.value.hash,
	(current) => {
		const hash = current.split("#")[1];
		if (hash === selectedState.value) {
			// avoids infinite watch loop
			return;
		}
		if (typeof hash !== "string" && hash === "") {
			return;
		}
		if (!fullyLoaded() || !getCourse(hash, { allowUnknown: true })) {
			return;
		}
		selectedState.value = hash;
	},
	{ deep: true, immediate: true },
);
watch(selectedState, (current) => {
	const hash = router.currentRoute.value.hash.split("#")[1];
	if (hash === current) {
		return;
	}
	if (!current) {
		return;
	}
	router.push({ hash: `#${current}` });
	// router.currentRoute.value.hash = current;
});
</script>

<template>
	<slot v-if="fullyLoaded()" />
	<button @click="reset">
		Reset (if not working or updating your version)
	</button>

	<label for="debug"> Enable debugging: </label>
	<input id="debug" type="checkbox" v-model="debug" />
	<pre v-if="debug">{{ "Version: " + current_version }} </pre>
	<pre v-if="debug">{{ localState }}</pre>
</template>
