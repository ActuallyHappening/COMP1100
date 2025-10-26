<script lang="ts" setup>
import { onMounted } from "vue";
import { refresh } from "../apis/state";
import { localState, reset, debug, current_version } from "../apis/state";
import { programs } from "../apis/db/program";
import { courses } from "../apis/db/course";
import { program_requirements } from "../apis/db/program_requirement";

onMounted(() => refresh());

const fullyLoaded = () => {
	return (
		!!localState.value?.plans?.[localState.value.current] &&
		!!programs.value &&
		!!courses.value &&
		!!program_requirements.value
	);
};
</script>

<template>
	<slot v-if="fullyLoaded()" />
	<button @click="reset">
		Reset (if not working or updating your version)
	</button>

	<label for="debug"> Enable debugging: </label>
	<input id="debug" type="checkbox" v-model="debug" />
	<pre v-if="debug">{{ "Version: " + current_version }} </pre>
	<pre v-if="debug">{{ localState }}</pre>
</template>
