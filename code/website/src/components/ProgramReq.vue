<script lang="ts" setup>
// import { reactive, inject, ref, watch, computed, onMounted } from "vue";
// import type { ProvidedExport } from "./State.vue";
// import type { ProgramRequirement } from "./State.vue";
// import { RecordId } from "surrealdb";
import _ from "lodash";
// // import { STATE } from "./State.vue";
// const {
// 	debug,
// 	localState,
// 	getCurrentPlanState,
// 	programs,
// 	getCurrentProgram,
// 	defaultPlan,
// 	program_requirements,
// 	getProgramRequirement,
// } = inject("state") as ProvidedExport;
// import { toast } from "vue3-toastify";

import { computed, watch } from "vue";
import type { ProgramRequirement } from "../apis/db/program_requirement";

const props = defineProps({
	index: { type: Number, required: true },
});

const options = computed((): ProgramRequirement[] => {
	const currentProgram = getCurrentProgram();
	if (!currentProgram) {
		return [];
	}
	const myReqs = currentProgram.program_requirements[props.index];
	if (!myReqs) {
		console.warn(
			`Couldn't find my reqs`,
			_.cloneDeep(currentProgram.program_requirements),
			props.index,
		);
		return [];
	}
	return myReqs.map((req) => getProgramRequirement(req));
});
watch(
	() => getCurrentProgram()?.program_requirements,
	() => {
		const currentProgram = getCurrentProgram();
		const me = currentProgram?.program_requirements?.[props.index];
		if (me) {
			if (me.length === 1) {
				// choose the only option available, duuh
				console.info(
					`Choosing the only option available`,
					_.cloneDeep(me),
				);
				getCurrentPlanState().topLevelReqsSelected[props.index] =
					me[0]!.id.toString();
			}
		}
	},
	{ deep: true, immediate: true },
);
</script>

<template>
	<!-- <pre v-if="debug"> {{ index }}</pre> -->
	<!-- <pre v-if="debug"> {{ allOptions() }}</pre> -->
	<!-- <pre v-if="debug"> {{ allOptionsLoaded() }}</pre> -->
	<template
		v-if="
			typeof getCurrentProgram()?.program_requirements?.[props.index] ===
			'undefined'
		"
	>
		<pre class="text-danger">Unknown index?</pre>
	</template>
	<template v-else>
		<select
			:value="getCurrentPlanState().topLevelReqsSelected[props.index]"
			@input="
				(ev) =>
					(getCurrentPlanState().topLevelReqsSelected[props.index] =
						ev.target?.value)
			"
			id="vue-ProgramReq"
			class="form-select"
		>
			<option value="" disabled hidden>Choose your major</option>
			<option
				v-for="option in options"
				:key="option.id.id.toString()"
				:value="option.id.id.toString()"
			>
				{{ option.name }}
			</option>
		</select>
	</template>
</template>
