<script lang="ts" setup>
import { inject, defineProps, computed } from "vue";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
});

const { getCourse } = inject("state");

const course = computed(() => {
	const ret = getCourse(props.code);
	if (!ret) {
		throw new Error(`Couldn't find course ${props.code}`);
	}
	return ret;
});
</script>

<template>
	<div id="vue-Course">
		<h4>
			{{ course.code }}
		</h4>
		<p>{{ course.name }}</p>
	</div>
	<!-- ui needing functionality -->
	<!--<button type="button" class="list-group-item list-group-item-action">
        <h4 class="text-center">CODE1111: Course name goes here (<i>Sem 1</i>)</h4>
        <p class="m-0 p-0">Prerequisites: <i>TGRA5500</i></p>
		<p class="m-0 p-0">Incompatible: <i>SOCI4100</i></p>
	</button>-->
</template>
