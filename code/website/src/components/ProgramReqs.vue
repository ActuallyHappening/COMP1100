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

type Err = any;
const error = ref(undefined as undefined | Err);
const handleError = (err: Err) => {
	console.error(err);
	error.value = err;
};

const $debug = (...args) => console.info(props.index, ...args);
const this_program_req = computed((): ProgramRequirement => {
	const ret = program_requirements.value.find(
		(req) => req.id.toString() == props.requirementId,
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
const flattened_course_codes = computed((): string[] | undefined => {
	return this_program_req.value.course_options
		?.flat()
		?.map((course) => course.id.toString());
});
const flattened_subreqs = computed((): string[] | undefined => {
	return this_program_req.value.sub_requirements?.map((req) =>
		req.toString(),
	);
});
</script>

<template>
	<ul
		:id="
			this_program_req.short_name
				? `vue-ProgramReqs-${this_program_req.short_name}`
				: `vue-ProgramReqs`
		"
	>
		<h5>{{ this_program_req.short_name }}</h5>
		<li
			v-if="flattened_course_codes"
			v-for="code in flattened_course_codes"
		>
			<Course :code="code" />
		</li>
		<ProgramReqs
			v-if="flattened_subreqs"
			v-for="code in flattened_subreqs"
			:requirement-id="code"
		/>
	</ul>
</template>
