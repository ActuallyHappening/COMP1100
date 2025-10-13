<script lang="ts" setup>
import { reactive, inject, ref, watch, computed } from "vue";
import type { Program, ProvidedExport } from "./State.vue";
import type { ProgramRequirement } from "./State.vue";
import Course from "./Course.vue";
import _ from "lodash";
const {
	debug,
	localState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
	courses,
} = inject("state") as ProvidedExport;

const props = defineProps({
	requirementId: { type: String, required: true },
});

const $debug = (...args) => console.info(props.index, ...args);
const this_program_req = computed((): ProgramRequirement => {
	const ret = program_requirements.value.find(
		(req) => req.id.id.toString() == props.requirementId,
	);
	if (!ret) {
		console.error(
			`ProgramReqs failed`,
			_.cloneDeep(program_requirements),
			_.cloneDeep(props),
		);
		throw new Error(`Couldn't find program_requirement in ProgramReqs.vue`);
	}
	return ret;
});
</script>

<template>
	<ul>
		<li>
			<Course
				v-for="course in this_program_req.sub_requirements"
				:code="course.id.toString()"
			/>
		</li>
	</ul>
</template>
