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

function listOfIncompatibles () {
	return "Incompatible: " + course.value.incompatible ? course.value.incompatible.map((coursestr)=>{
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
		<p>{{ course.prerequisites }}</p>
		<pre v-if="debug"> {{  course  }}</pre>
	</div>
</template>
