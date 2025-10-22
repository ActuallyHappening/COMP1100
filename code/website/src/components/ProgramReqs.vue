<script lang="ts" setup>
import { reactive, inject, ref, watch, computed } from "vue";
import type { Program, ProvidedExport } from "./State.vue";
import type { ProgramRequirement } from "./State.vue";
import Course from "./Course.vue";
import _ from "lodash";
import { RecordId } from "surrealdb";
const {
	debug,
	localState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
	getProgramRequirement,
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
const this_program_req = computed((): ProgramRequirement | undefined => {
	return getProgramRequirement(
		new RecordId("program_requirement", props.requirementId),
	);
});
const flattened_course_codes = computed((): string[] | undefined => {
	return this_program_req.value?.course_options
		?.flat()
		?.map((course) => course.id.toString());
});
const flattened_subreqs = computed((): string[] | undefined => {
	return this_program_req.value?.sub_requirements?.map((req) =>
		req.toString(),
	);
});
</script>

<template>
	<div
		:id="
			this_program_req.short_name
				? `vue-ProgramReqs-${this_program_req.short_name}`
				: `vue-ProgramReqs`
		"
	>
		<h5>{{ this_program_req.short_name }}</h5>
		<div
			v-if="flattened_course_codes"
			v-for="code in flattened_course_codes"
			class="list-group"
		>
			<Course :code="code" type="default" />
		</div>
		<ProgramReqs
			v-if="flattened_subreqs"
			v-for="code in flattened_subreqs"
			:requirement-id="code"
		/>
	</div>
</template>
