<script setup lang="ts">
import { useRouter } from "vue-router";
import { oldState, state } from "../state";

const router = useRouter();

function next() {
	console.log(`Student number: `, state.value.studentNumber);
	oldState.value.studentNumber = state.value.studentNumber;
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
		<input type="submit" value="Next" />
	</form>
</template>

<style scoped></style>
