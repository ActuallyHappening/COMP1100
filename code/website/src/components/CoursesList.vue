<script lang="ts" setup>
import { inject } from "vue";
import Course from "./Course.vue";

const { courses } = inject("state");
</script>

<template>
	<ul>
		<li v-for="course in courses" :key="course.code">
			<Course :code="course.code" />
		</li>
	</ul>
</template>
