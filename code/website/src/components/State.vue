<script lang="ts" setup>
import { onMounted } from "vue";
import { refresh } from "../apis/db";
import {
	localState,
	hardResetLocalState,
	debug,
	current_version,
} from "../apis/state";
import { programs as _programs } from "../apis/db/program";
import { courses as _courses } from "../apis/db/course";
import { program_requirements as _program_requirements } from "../apis/db/program_requirement";
import {
	localState as _localState,
	selectedState as _selectedState,
} from "../apis/state";

// These are here so you can see them in the vue dev tools
const programs = _programs;
const courses = _courses;
const program_requirements = _program_requirements;
const localState = _localState;
const selectedState = _selectedState;

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
	<button
		@click="() => hardResetLocalState(`You pressed the big red button ...`)"
	>
		Reset (if not working or updating your version)
	</button>

	<label for="debug"> Enable debugging: </label>
	<input id="debug" type="checkbox" v-model="debug" />
	<pre v-if="debug">{{ "Version: " + current_version }} </pre>
	<pre v-if="debug">{{ localState }}</pre>
</template>
