<script setup lang="ts">
import { useRouter } from "vue-router";
import { state } from "../state";

const router = useRouter();

function next() {
	console.log(`Student number: `, state.studentNumber);
	router.push({ path: `/onboarding/program` });
}
</script>

<template>
	<h1>Your Student Number?</h1>
	<form @submit.prevent="next">
		<input
			v-model="state.studentNumber"
			type="number"
			min="1000000"
			max="9999999"
		/>
	</form>
</template>

<style scoped></style>
