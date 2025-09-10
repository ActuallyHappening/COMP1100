<script setup lang="ts">
import { ref } from "vue";

const studentNumber = ref(10000000);
function next() {
	console.log();
}
</script>

<template>
	<h1>Your Student Number?</h1>
	<form @submit="next">
		<input
			:value="studentNumber"
			type="number"
			min="10000000"
			max="99999999"
		/>
	</form>
</template>

<style scoped></style>
