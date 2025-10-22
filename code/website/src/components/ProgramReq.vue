<script lang="ts" setup>
import { reactive, inject, ref, watch, computed } from "vue";
import type { ProvidedExport } from "./State.vue";
import type { ProgramRequirement } from "./State.vue";
import { RecordId } from "surrealdb";
import _ from "lodash";
// import { STATE } from "./State.vue";
const {
	debug,
	localState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
	getProgramRequirement,
} = inject("state") as ProvidedExport;
import { toast } from "vue3-toastify";

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
</script>

<template>
	<!-- <pre v-if="debug"> {{ index }}</pre> -->
	<!-- <pre v-if="debug"> {{ allOptions() }}</pre> -->
	<!-- <pre v-if="debug"> {{ allOptionsLoaded() }}</pre> -->
	<template
		v-if="
			typeof getCurrentProgram()?.program_requirements?.[props.index] ===
			'object'
		"
	>
		<pre class="text-danger">Loading</pre>
	</template>
	<template v-else>
		<select
			v-model="getCurrentPlanState().topLevelReqsSelected[props.index]"
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
