<script lang="ts" setup>
/**
 * This file manages the network and localStorage state
 */

import { useStorage } from "@vueuse/core";
import { computed, provide, onMounted, ref } from "vue";

export const defaultPlan = (num: number) => ({
	name: `Plan ${num}`,
	programId: null,
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
export const localState = _localState;

export const planState = () => {
	const ret = localState?.value.plans?.[localState.value.current];
	console.log(`planState`, ret);
	// if (typeof ret === "undefined") {
	// 	// REALLY should never hit this but we do?
	// 	console.info(`Returning default plan`, defaultPlan(-1));
	// 	return defaultPlan(-1);
	// }
	return ret;
};
const planStateLoaded = () => {
	return !!planState;
};

const programs = ref(null as );
const courses = ref(null);

import { Surreal, Table } from "surrealdb";

onMounted(() => {
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
		.then(async () => {
			programs.value = await db.select(new Table("program"));
			courses.value = await db.select(new Table("course"));
		});
});

console.log(programs, courses);

export const STATE = Symbol("App level state");
provide(STATE, {
	localState,
	planState,
	programs,
	defaultPlan,
});
</script>

<template>
	<pre>{{ localState }}</pre>
	<slot v-if="planStateLoaded()" />
</template>
