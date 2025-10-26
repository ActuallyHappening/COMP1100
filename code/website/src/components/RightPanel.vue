<script lang="ts" setup>
import Course from "./Course.vue";
import { selectedState } from "../apis/state";
</script>
<template>
	<Course
		class="rhs"
		v-if="selectedState"
		:code="selectedState"
		type="summary"
	/>
</template>
<style>
button.rhs:hover {
	background-color: inherit;
}
</style>
