<script lang="ts" setup>
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { Course, ProvidedExport, Prereq } from "./State.vue";

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

const { getCourse, selectedState, error_course } = inject(
	"state",
) as ProvidedExport;
type Err = any;
const error = ref(undefined as undefined | Err);
const handleError = (err: Err) => {
	console.error(err);
	error.value = err;
};

const course = computed((): Course | undefined => {
	const ret = getCourse(props.code);
	if (!ret) {
		handleError(new Error(`Couldn't find course ${props.code}`));
		return error_course(`Couldn't find course ${props.code}`);
	}
	return ret;
});
const renderPrereq = (arr: Prereq) => {
	const ret = [];
	for (const idiom of arr) {
		if (idiom === "OR" || idiom === "AND") {
			ret.push(idiom.toLowerCase());
		} else if (typeof idiom.id === "string") {
			ret.push(idiom.id.toUpperCase());
		} else {
			ret.push("(" + renderPrereq(idiom) + ")");
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
	if (!course.value) {
		return;
	}
	console.info(`Selecting course: `, course.value.code);
	selectedState.value = course.value.code;
};

const courseElements = Array.from(document.querySelectorAll<HTMLElement>('[id^=vue-Course-]'));
document.addEventListener('click', (event) => {
	const target = event.target as Node;
	const clickedInside = courseElements.some(el => el.contains(target));
	if (!clickedInside) {
		courseElements.forEach(el => {
			el.classList.remove('course-selection-active');
		});
	};
});
</script>

<template>
	<!-- let me know if these need to be -->
	<button
		type="button"
		class="list-group-item"
		:class="{ 'course-selection-active': selectedState === course?.code }"
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
				<h4>{{ course?.code }}</h4>
			</template>
			<template v-else-if="type === 'summary'">
				<h4>{{ course?.code }}</h4>
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

</style>
