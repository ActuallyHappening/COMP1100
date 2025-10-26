<script lang="ts" setup>
import { inject, reactive, ref, provide, watch } from "vue";
import type { ProvidedExport, Course } from "./State.vue";
import _ from "lodash";
import { router } from "../routes";

export type Filter = {
	search: string;
	sem_1: boolean;
	sem_2: boolean;
	sem_summer: boolean;
};
const defaultFilter = (): Filter =>
	_.cloneDeep({
		search: "",
		sem_1: false,
		sem_2: false,
		sem_summer: false,
	});
const filterAPI = {
	filterCourses(courses: Course[]): {
		courses: Course[];
		message: string | undefined;
	} {
		// TODO
		return { courses, message: "TODO" };
	},
	clear() {
		filters.value = defaultFilter();
	},
};

const filters = ref(defaultFilter());

const exportAPI = {
	filters,
	filterAPI,
};
export type FilterExport = typeof exportAPI;

// ** Routing **
watch(
	() => filters.value,
	(current) => {
		console.log(`REMOVEME updating query to `, current);
		router.push({ query: _.cloneDeep(filters.value) });
	},
	{ deep: true, immediate: true },
);
provide("filter", exportAPI);
</script>
<template>
	<div class="input-group">
		<label for="top-level-search">Search for courses:</label>
		<input type="search" id="top-level-search" v-model="filters.search" />

		<fieldset>
			<legend>Semesters offered:</legend>
		</fieldset>
		<label for="top-level-sem-1">Sem 1:</label>
		<input type="checkbox" v-model="filters.sem_1" />
		<label for="top-level-sem-2">Sem 2:</label>
		<input type="checkbox" v-model="filters.sem_2" />
		<label for="top-level-sem-summer">Sem Summer:</label>
		<input type="checkbox" v-model="filters.sem_summer" />

		<button @click="filterAPI.clear">Clear Filters</button>
	</div>
</template>
