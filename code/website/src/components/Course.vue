<script lang="ts" setup>
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { Course, ProvidedExport, Prereq } from "./State.vue";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
});

const { getCourse } = inject("state") as ProvidedExport;
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
		return {
			code: "Cannot Find Course",
			name: "Cannot find course",
			prerequisites: [],
			incompatible: [],
		} as Course;
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
const prereqs = computed(() => {
	if (course.value?.prerequisites) {
		return renderPrereq(course.value?.prerequisites);
	} else {
		return "";
	}
});
const incompatible = computed(() => {
	if (course.value?.incompatible) {
		return course.value.incompatible
			.map((id) => id.toUpperCase())
			.join(", ");
	} else {
		return "";
	}
});
</script>

<template>
	<!-- let me know if these need to be -->
	<button
		type="button"
		class="list-group-item list-group-item-action"
		id="vue-Course"
	>
		<template v-if="!error">
			<h4 class="text-center">
				{{ course.code }}: {{ course.name }} (<i>Sem 1</i>)
			</h4>
			<p class="m-0 p-0" v-if="prereqs">
				Prerequisites: <i>{{ prereqs }}</i>
			</p>
			<p class="m-0 p-0" v-if="incompatible">
				Incompatible: <i>{{ incompatible }}</i>
			</p>
		</template>
		<ErrorView v-else :err="error" />
	</button>
</template>
