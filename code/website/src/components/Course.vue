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
</template>
