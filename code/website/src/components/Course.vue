<script lang="ts" setup>
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
});

const { getCourse } = inject("state");
type Err = any;
const error = ref(undefined as undefined | Err);
const handleError = (err: Err) => {
	console.error(err);
	error.value = err;
};

const course = computed(() => {
	const ret = getCourse(props.code);
	if (!ret) {
		return handleError(new Error(`Couldn't find course ${props.code}`));
	}
	return ret;
});
</script>

<template>
	<div id="vue-Course">
		<template v-if="!error">
			<h4>
				{{ course.code }}
			</h4>
			<p>{{ course.name }}</p>
		</template>
		<ErrorView v-else :err="error" />
	</div>
	<!-- ui needing functionality -->
	<!--<button type="button" class="list-group-item list-group-item-action">
        <h4 class="text-center">CODE1111: Course name goes here (<i>Sem 1</i>)</h4>
        <p class="m-0 p-0">Prerequisites: <i>TGRA5500</i></p>
		<p class="m-0 p-0">Incompatible: <i>SOCI4100</i></p>
	</button>-->
</template>
