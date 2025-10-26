<script lang="ts" setup>
import { reactive, inject, ref, watch, computed } from "vue";
import type { Program, ProvidedExport } from "./State.vue";
import type { ProgramRequirement } from "./State.vue";
import Course from "./Course.vue";
import _ from "lodash";
import { RecordId } from "surrealdb";
import type { FilterExport } from "./FilterHeader.vue";
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
	courseAPI,
	getCourse,
} = inject("state") as ProvidedExport;
const { filterAPI } = inject("filter") as FilterExport;

const props = defineProps({
	// id/code part only
	requirementId: {
		type: String,
		required: true,
		validator(value: string) {
			if (value.includes(":")) {
				console.warn(`ProgramReqs passed invalid prop`, value);
			}
			return !value.includes(":");
		},
	},
});

type Err = any;
const error = ref(undefined as undefined | Err);
const handleError = (err: Err) => {
	console.error(err);
	error.value = err;
};

const $debug = (...args) => console.info(props.index, ...args);
const this_program_req = computed((): ProgramRequirement => {
	return getProgramRequirement(
		new RecordId("program_requirement", props.requirementId),
	);
});
const filtered_courses = computed(() => {
	const courses = this_program_req.value?.course_options
		?.flat()
		?.map((course) => courseAPI.getCourse(course))
		?.filter((course) => !!course);
	if (courses) {
		return filterAPI.filterCourses(courses);
	}
});
const flattened_subreqs = computed((): string[] | undefined => {
	return this_program_req.value?.sub_requirements?.map((req) =>
		req.id.toString(),
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
		class="left-panel-inner"
	>
		<h5>{{ this_program_req.short_name }}</h5>
		<div
			v-if="filtered_courses"
			v-for="course in filtered_courses.courses"
			class="list-group"
		>
			<Course :code="course.code" type="default" />
		</div>
		<p v-if="filtered_courses?.message">{{ filtered_courses.message }}</p>
		<ProgramReqs
			v-if="flattened_subreqs"
			v-for="code in flattened_subreqs"
			:requirement-id="code"
		/>
	</div>
</template>
