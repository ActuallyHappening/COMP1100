<script lang="ts" setup>
import _ from "lodash";
import { computed, watch } from "vue";
import {
	programRequirementAPI,
	type ProgramRequirement,
} from "../apis/db/program_requirement";
import { programAPI } from "../apis/db/program";
import { planAPI } from "../apis/plan";

const props = defineProps({
	index: { type: Number, required: true },
});

const options = computed((): ProgramRequirement[] => {
	const currentProgram = programAPI.getCurrent();
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
	return myReqs
		.map((req) => programRequirementAPI.get(req))
		.filter((req) => !!req);
});
watch(
	() => programAPI.getCurrent()?.program_requirements,
	() => {
		const currentProgram = programAPI.getCurrent();
		const me = currentProgram?.program_requirements?.[props.index];
		if (me) {
			if (me.length === 1) {
				// choose the only option available, duuh
				console.info(
					`Choosing the only option available`,
					_.cloneDeep(me),
				);
				planAPI.getCurrent().topLevelReqsSelected[props.index] =
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
			typeof programAPI.getCurrent()?.program_requirements?.[
				props.index
			] === 'undefined'
		"
	>
		<pre class="text-danger">Unknown index?</pre>
	</template>
	<template v-else>
		<!-- Patrick TODO please make this look better -->
		<p v-if="options.length === 1">{{ options[0].name }}</p>
		<select
			v-else
			:value="planAPI.getCurrent()!.topLevelReqsSelected[props.index]"
			@input="
				(ev) =>
					(planAPI.getCurrent()!.topLevelReqsSelected[props.index] =
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
