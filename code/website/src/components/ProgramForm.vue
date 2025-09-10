<script setup lang="ts">
import { useRouter } from "vue-router";
import { state } from "../state";

const router = useRouter();

// const studentNumber = ref(1234567);
function next() {
	console.log(`Proram Code`, state.programCode);
	router.push({ path: `/onboarding/plans` });
}
</script>

<template>
	<h1>Which program at UQ are you taking?</h1>
	<form @submit.prevent="next">
		<select>
			<option>Maths and Computer Science</option>
		</select>
	</form>
</template>

<style scoped></style>
