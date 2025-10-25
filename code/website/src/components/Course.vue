<script lang="ts" setup>
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { Course, ProvidedExport, Prereq } from "./State.vue";
import _ from "lodash";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
	type: {
		required: true,
		type: String,
		default: "default",
	},
});

const {
	getCourse,
	selectedState,
	error_course,
	getCurrentPlanState,
	plannerAPI,
} = inject("state") as ProvidedExport;

type Err = any;
const error = ref(undefined as undefined | Err);
const handleError = (err: Err) => {
	console.error(err);
	error.value = err;
};

const course = computed((): Course => {
	const ret = getCourse(props.code);
	if (!ret) {
		handleError(new Error(`Couldn't find course ${props.code}`));
		return error_course(`Couldn't find course ${props.code}`);
	}
	return ret;
});
const renderPrereq = (
	arr: Prereq,
	options?: { course_cb?: (id: string) => string },
) => {
	const settings = {
		course_cb: (id: string) => id.toUpperCase(),
		...options,
	};
	const ret = [];
	for (const idiom of arr) {
		if (idiom === "OR" || idiom === "AND") {
			ret.push(idiom.toLowerCase());
		} else if (typeof idiom.id === "string") {
			ret.push(settings.course_cb(idiom.id));
		} else {
			ret.push("(" + renderPrereq(idiom, settings) + ")");
		}
	}
	return ret.join(" ");
};
const prereqs_list = computed(() => {
	if (course.value?.prerequisites) {
		return renderPrereq(course.value?.prerequisites);
	} else {
		return "";
	}
});
const prereqs_list_html = computed(() => {
	if (course.value?.prerequisites) {
		return renderPrereq(course.value?.prerequisites, {
			course_cb: (id: string) =>
				`<a href="#${id}">${id.toUpperCase()}</a>`,
		});
	} else {
		return "";
	}
});
const incompatible_list = computed(() => {
	if (course.value?.incompatible) {
		return course.value.incompatible
			.map((id) => id.id.toUpperCase())
			.join(", ");
	} else {
		return "";
	}
});
const sems = computed(() => {
	if (!course.value) {
		return "";
	}
	const summer = course.value.sem_summer ? " + Summer" : "";
	if (course.value.sem_1 && course.value.sem_2) {
		return "Sem 1 & 2" + summer;
	} else if (course.value.sem_1) {
		return "Sem 1" + summer;
	} else if (course.value.sem_2) {
		return "Sem 2" + summer;
	} else {
		handleError("Unknown semesters");
		return "Unknown" + summer;
	}
});
const selectCourse = () => {
	switch (props.type) {
		case "default":
			if (selectedState.value == course.value.id.toString()) {
				// already selected
				selectedState.value = undefined;
			} else {
				console.info(`Selecting course: `, course.value.id);
				selectedState.value = course.value.id.id.toString();
			}
			break;
		case "small":
			selectedState.value = course.value.id.id.toString();
	}
};
const prereqChecked = computed(() => {
	// console.info(
	// 	`DEBUG`,
	// 	_.cloneDeep(course.value.id),
	// 	_.cloneDeep(getCurrentPlanState().planner),
	// );
	const planner = plannerAPI(getCurrentPlanState().planner);
	const sem_index = planner.getIndexOfCourse(course.value.id);
	if (!sem_index) {
		return undefined;
	}
	const [sem_id, _index] = sem_index;
	const previous = planner.previousCoursesTo(sem_id, course.value.id);
	const prereqCheck = planner.prereqCheck({
		previousCourses: previous,
		thisCourse: course.value,
	});
	return prereqCheck;
});
const close = () => {
	// remove this from selected and from visual planner
	const planner = plannerAPI(getCurrentPlanState().planner);
	planner.removeCourse(course.value.id);
};

// const courseElements = Array.from(document.querySelectorAll<HTMLElement>('[id^=vue-Course-]'));
// document.addEventListener('click', (event) => {
// 	const target = event.target as Node;
// 	const clickedInside = courseElements.some(el => el.contains(target));
// 	if (!clickedInside) {
// 		courseElements.forEach(el => {
// 			el.classList.remove('course-selection-active');
// 		});
// 	};
// });
</script>

<template>
	<button
		type="button"
		class="list-group-item w-100"
		:class="{
			'course-selection-active':
				type === 'default' && selectedState === course?.code,
		}"
		:id="'vue-Course-' + course?.code"
		@click="selectCourse"
	>
		<template v-if="!error">
			<template v-if="type === 'default'">
				<h4 class="text-center">
					{{ course?.code }}: {{ course?.name }} (<i>{{ sems }}</i
					>)
				</h4>
				<p class="m-0 p-0" v-if="prereqs_list">
					Prerequisites: <i>{{ prereqs_list }}</i>
				</p>
				<p class="m-0 p-0" v-if="incompatible_list">
					Incompatible: <i>{{ incompatible_list }}</i>
				</p>
			</template>

			<template v-else-if="type === 'small'">
				<div class="justify-content-end d-flex">
					<div class="m-auto">
						<h4 class="pb-0 mb-0">{{ course?.code }}</h4>
					</div>
					<div>
						<button
							type="button"
							class="btn-close"
							aria-label="Close"
							@click.prevent="close"
						></button>
					</div>
				</div>
				<i
					><p class="p-0 m-0">{{ course?.name }}</p></i
				>
				<p class="m-0 p-0">Core course</p>
				<p class="m-0 p-0">
					Prereqs passed: {{ prereqChecked ? "YES!" : "NO" }}
				</p>
			</template>

			<template v-else-if="type === 'summary'">
				<a
					class="mb-2"
					:href="
						'https://programs-courses.uq.edu.au/course.html?course_code=' +
						course?.code
					"
					target="_blank"
				>
					<h3 class="text-center">{{ course?.code }}</h3>
					<p class="text-center">{{ course?.name }}</p>
				</a>
				<ul class="text-start">
					<li>
						<h5>
							<strong
								>Semesters offered:
								<span
									title="Based on previous course offerings.
							Information may not be valid in future semesters."
									>&#9432;</span
								></strong
							>
						</h5>
						<p>
							{{ course?.code }} is available in the following
							semesters: {{ sems }}
						</p>
					</li>
					<li>
						<h5><strong>Prerequisites:</strong></h5>
						<p v-if="prereqs_list" v-html="prereqs_list_html"></p>
						<p v-else>
							{{ course?.code }} has no prerequisite courses.
						</p>
						<p v-if="prereqChecked">
							You have completed all necessary prerequisites to
							begin this course.
						</p>
						<p v-else-if="prereqs_list && !prereqChecked">
							You need to complete:
						</p>
					</li>
					<li v-if="incompatible_list">
						<h5><strong>Incompatibilities:</strong></h5>
						<!-- shows up optionally? -->
						<p>
							{{ course?.code }} is incompatible with
							{{ incompatible_list }}.
						</p>
						<!-- <p>Please </p> -->
					</li>
					<li>
						<h5><strong>Credits:</strong></h5>
						<p>This course counts _ towards _.</p>
					</li>
				</ul>
			</template>

			<template v-else>
				<ErrorView
					:err="
						new Error(
							`Unknown course type <Course type='${type}' />`,
						)
					"
				/>
			</template>
		</template>
		<ErrorView v-else :err="error" />
	</button>
</template>

<style scoped>
button.course-selection-active {
	background-color: #8653b5;
}

button.course-selection-active:hover {
	background-color: #b478eb;
}

table button:hover {
	background-color: inherit;
}
</style>
