<script lang="ts" setup>
/**
 * This file manages the network and localStorage state
 */

import { useStorage } from "@vueuse/core";
import { computed, provide, onMounted, ref, reactive, watch } from "vue";
import _ from "lodash";
import * as semver from "semver";
import { toast } from "vue3-toastify";

const current_version = "0.0.1";
const compatible_versions = `=${current_version}`;
const debug = useStorage("debug", false);

const sem_ids = ["2025 Sem 2", "2026 Sem 1"] as const;
export type SemId = (typeof sem_ids)[number];
const defaultPlanner = (): Planner => {
	const ret = {} as Planner;
	for (const sem_id of sem_ids) {
		ret[sem_id] = [undefined, undefined, undefined, undefined];
	}
	return ret;
};

/** Course code */
const selectedState = ref(undefined as undefined | string);

export type PlanState = {
	name: string;
	programId: string;
	majorId: string;
	programRequirementsSelected: string[];
	planner: Planner;
};
const defaultPlan = (num: number) =>
	_.cloneDeep({
		name: `Plan ${num}`,
		programId: null,
		/** An additive list of all program requirements selected by the user, even for irrelevant majors / programs */
		programRequirementsSelected: [],
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
const _localState = useStorage(
	`student-info`,
	reactive(_.cloneDeep(defaultState)),
);
// export const localState = computed(() => _localState ?? defaultState);
const localState = _localState;
const reset = () => {
	localState.value = _.cloneDeep(defaultState);
};
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

const planState = (): PlanState | undefined => {
	const ret = localState.value?.plans?.[localState.value.current];
	// console.log(`planState`, ret);
	// if (typeof ret === "undefined") {
	// 	// REALLY should never hit this but we do?
	// 	console.info(`Returning default plan`, defaultPlan(-1));
	// 	return defaultPlan(-1);
	// }
	return ret;
};
const getCurrentPlanState = (): PlanState => {
	const ret = planState();
	if (!ret) {
		console.error(`getCurrentPlanState returned undefined`);
	}
	return ret!;
};

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
	| "breadth";
const requirement_type_to_header = (requirement: RequirementType): string => {
	if (requirement === "core") {
		return "Core";
	} else if (requirement === "major") {
		return "Major";
	} else if (requirement === "nomaj") {
		return "No Major";
	} else if (requirement === "extmaj") {
		return "Extended Major";
	} else {
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
const is_id = (id1): bool => {
	return id1 instanceof RecordId;
};
const id_equal = (id1, id2) => {
	// TODO
	// if
};
const getProgramRequirement = (
	id: RecordId<string>,
): ProgramRequirement | undefined => {
	if (!program_requirements.value || !is_id(id)) {
		toast(`getProgramRequirement invariant broken`, { type: "warning" });
		return undefined;
	}
	const ret = program_requirements.value.find(
		(req) => req.id.id.toString() === id.id.toString(),
	);
	if (!ret) {
		const error = new Error(`Couldn't getProgramRequirement(${id})`);
		console.error(error);
		toast(error.message, { type: "error" });
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
	const _planState = planState();
	if (!_planState) {
		return undefined;
	}
	const ret = programs.value.find(
		(program) => program.id.toString() === _planState.programId,
	);
	if (!ret) {
		console.info(
			`getCurrentProgram returned undefined`,
			_.cloneDeep(programs.value),
			_planState.programId,
		);
	}
	return ret;
}

function getCourse(code: string): Course | undefined {
	return courses.value.find((course) => course.code == code.toUpperCase());
}

import { RecordId, Surreal, Table } from "surrealdb";
import type { Planner } from "./PlannerVisuals.vue";

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
	planState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
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
</script>

<template>
	<slot v-if="fullyLoaded()" />
	<button @click="reset">
		Reset (if not working or updating your version)
	</button>

	<label for="debug"> Enable debugging: </label>
	<input id="debug" type="checkbox" v-model="debug" />
	<pre v-if="debug">{{ localState }}</pre>
</template>
