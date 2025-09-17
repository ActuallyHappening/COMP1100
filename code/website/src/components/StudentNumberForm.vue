<script setup lang="ts">
import { useRouter } from "vue-router";
import { oldState, localState } from "../state";

const router = useRouter();

function next() {
	console.log(`Student number: `, localState.value.studentNumber);
	oldState.value.studentNumber = localState.value.studentNumber;
	router.push({ path: `/onboarding/program` });
}
</script>

<template>
	<h1>Your Student Number?</h1>
	<form @submit.prevent="next">
		<input
			v-model="localState.studentNumber"
			type="number"
			min="1000000"
			max="9999999"
		/>
		<input type="submit" value="Next" />
	</form>
</template>

<style scoped></style>
