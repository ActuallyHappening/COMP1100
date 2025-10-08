<script lang="ts" setup>
import { inject, defineProps, computed } from "vue";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
});

const { getCourse } = inject("state");

const course = computed(() => getCourse(props.code));
</script>

<template>
	<div>
		<h4>
			{{ course.code }}
		</h4>
		<p>{{ course.name }}</p>
	</div>
</template>
