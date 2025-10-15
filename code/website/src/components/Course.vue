<script lang="ts" setup>
import { inject, defineProps, computed } from "vue";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
});

const { getCourse, debug } = inject("state");

const course = computed(() => {
	const ret = getCourse(props.code);
	if (!ret) {
		throw new Error(`Couldn't find course ${props.code}`);
	}
	return ret;
});

function listOfIncompatibles() {
	return "Incompatible: " + !!course.value.incompatible
		? course.value.incompatible
				.map((course_id) => {
					return course_id.id.toUpperCase();
				})
				.join(", ")
		: "NONE";
}

function listOfPrerequisites () {
	return "Prerequisites: " + course.value.prerequisites ? course.value.prerequisites.map((coursestr) => {
		return coursestr.split(':')[1].toUpperCase();
	}).join(", ") : "NONE"
}

</script>

<template>
	<div id="vue-Course">
		<h4>
			{{ course.code }}
		</h4>
		<p>{{ course.name }}</p>
		<p>{{ listOfIncompatibles() }}</p>
<<<<<<< HEAD
		<p>{{ course.prerequisites }}</p>
		<pre v-if="debug"> {{ course }}</pre>
=======
		<p>{{ listOfPrerequisites() }}</p>
		<pre v-if="debug"> {{  course  }}</pre>
>>>>>>> 356d93a (RC added prerequisites to website)
	</div>
</template>
