<script lang="ts" setup>
import { computed } from "vue";
import {
	programRequirementAPI,
	type ProgramRequirement,
} from "../apis/db/program_requirement";
import { RecordId } from "surrealdb";
import { courseAPI } from "../apis/db/course";
import { filterAPI } from "../apis/filter";
import { planAPI } from "../apis/plan";
import Course from "./Course.vue";

const coursesInPlanArray: { [key: string]: { [key: string]: any } } = planAPI.getCurrent().planner;
var coursesInPlan = [] as string[];
for (const course in coursesInPlanArray) {
	for (const c in coursesInPlanArray[course]) {
		if (coursesInPlanArray[course][c]) {
			coursesInPlan.push(coursesInPlanArray[course][c]);
		};
	};
};

const props = defineProps({
	// id/code part only
	requirementId: {
		type: String,
		required: true,
	},
});

const this_program_req = computed((): ProgramRequirement => {
	return programRequirementAPI.getOrError(
		new RecordId("program_requirement", props.requirementId),
	);
});
const filtered_courses = computed(() => {
	const courses = this_program_req.value?.course_options
		?.flat()
		?.map((course) => courseAPI.get(course))
		?.filter((course) => !!course);
	if (courses) {
		return filterAPI.filterCourses(courses, coursesInPlan);
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
		<!--<h5>{{ this_program_req.short_name }}</h5>-->
		
		<div v-if="filtered_courses">
			<div
			v-for="course in filtered_courses.courses"
			class="list-group"
		>
				<Course :code="course.code" type="default" />
			</div>
		</div>
		<p v-if="filtered_courses?.message">{{ filtered_courses.message }}</p>
		<ProgramReqs
			v-if="flattened_subreqs"
			v-for="code in flattened_subreqs"
			:requirement-id="code"
		/>
	</div>
</template>
