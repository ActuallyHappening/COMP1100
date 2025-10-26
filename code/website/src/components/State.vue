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
	courseAPI,
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
