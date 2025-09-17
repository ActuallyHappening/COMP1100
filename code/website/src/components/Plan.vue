<script setup lang="ts">
import { useRouter } from "vue-router";
import { oldState, localState } from "../state";

const router = useRouter();

// const studentNumber = ref(1234567);
function next() {
	console.log(`Proram Code`, localState.value.programCode);
	oldState.value.programCode = localState.value.programCode;
	router.push({ path: `/onboarding/plans` });
}
</script>

<template>
	<RouterLink to="student-number"> Back </RouterLink>
	<h1>Which program at UQ are you taking?</h1>
	<form @submit.prevent="next">
		<select>
			<option>Maths and Computer Science</option>
		</select>
		<input type="submit" value="Next" />
	</form>
</template>

<style scoped></style>
