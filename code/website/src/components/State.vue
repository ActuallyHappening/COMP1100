<script lang="ts" setup>
/**
 * This file manages the network and localStorage state
 */

import { useStorage } from "@vueuse/core";
import { computed, provide, onMounted, ref } from "vue";
import _ from "lodash";

const debug = useStorage("debug", false);

const defaultPlan = (num: number) => ({
	name: `Plan ${num}`,
	programId: null,
	programRequirementsSelected: [],
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
const _localState = useStorage(`student-info`, defaultState);
// export const localState = computed(() => _localState ?? defaultState);
const localState = _localState;

const planState = () => {
	const ret = localState.value?.plans?.[localState.value.current];
	console.log(`planState`, ret);
	// if (typeof ret === "undefined") {
	// 	// REALLY should never hit this but we do?
	// 	console.info(`Returning default plan`, defaultPlan(-1));
	// 	return defaultPlan(-1);
	// }
	return ret;
};
const planStateLoaded = () => {
	return !!localState.value?.plans?.[localState.value.current];
};

export type Program = {
	id: RecordId<string>;
	code: number;
	name: string;
	url: string;
};
export type Course = {
	id: RecordId<string>;
	code: string;
	cp: number;
	name: string;
	prerequisites: string[];
	sem_1: boolean;
	sem_2: boolean;
	sem_summer: boolean;
};
export type ProgramRequirements = {
	id: RecordId<string>;
	name: string;
	short_name: string | undefined;
	required_cp: number | undefined;
	sub_requirements: ProgramRequirements[][] | undefined;
	course_options: Course[][] | undefined;
};

const programs = ref(null! as Program[]);
const courses = ref(null! as Course[]);
const program_requirements = ref(null! as ProgramRequirements[]);

function getCourse(code: string): Course | undefined {
	return courses.value.find((course) => course.code == code);
}

import { RecordId, Surreal, Table } from "surrealdb";

function refresh() {
	const db = new Surreal();
	return Promise.resolve()
		.then(() => {
			// Open a connection and authenticate
			let dbPassword;
			if (typeof process !== "undefined") {
				// assuming running node directly
				dbPassword = process.env.COMP1100_PASSWORD;
			} else {
				// assuming this is running in the browser
				dbPassword = import.meta.env.VITE_COMP1100_PASSWORD;
			}
			return db.connect(
				"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
				{
					namespace: "comp1100",
					database: "master",
					// auth: {
					// 	username: "im-lazy-user",
					// 	password: dbPassword,
					// },
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
provide("state", {
	localState,
	planState,
	programs,
	defaultPlan,
	courses,
	getCourse,
	refresh,
});
</script>

<template>
	<pre v-if="debug">{{ localState }}</pre>
	<slot v-if="planStateLoaded()" />
</template>
