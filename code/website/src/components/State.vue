<script lang="ts" setup>
/**
 * This file manages the network and localStorage state
 */

import { useStorage } from "@vueuse/core";
import { computed, provide, onMounted, ref, reactive } from "vue";
import _ from "lodash";
import { Planner } from "./PlannerVisuals.vue";

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
	program_requirements: RecordId<string>[];
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
export type ProgramRequirement = {
	id: RecordId<string>;
	name: string;
	short_name: string | undefined;
	required_cp: number | undefined;
	sub_requirements: RecordId<string>[] | undefined;
	course_options: RecordId<string>[][] | undefined;
};

const programs = ref(null! as Program[]);
const courses = ref(null! as Course[]);
const program_requirements = ref(null! as ProgramRequirement[]);

function getCurrentProgram(): Program | undefined {
	const ret = programs.value.find(
		(program) => program.id.toString() === planState().programId,
	);
	if (!ret) {
		console.info(
			`getCurrentProgram returned undefined`,
			_.cloneDeep(programs.value),
			planState().programId,
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
	refresh,
	sem_ids,
	selectedState,
	error_course,
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
	<pre v-if="debug">{{ localState }}</pre>
	<slot v-if="fullyLoaded()" />
	<button @click="reset">
		Reset (if not working or updating your version)
	</button>

	<label for="debug"> Enable debugging: </label>
	<input id="debug" type="checkbox" v-model="debug" />
</template>
