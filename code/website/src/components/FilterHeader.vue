<script lang="ts" setup>
import { inject, reactive, ref, provide, watch } from "vue";
import { router } from "../routes";
import type { FilterExport } from "./filterAPI";

const { filterAPI } = inject("filter") as FilterExport;

// ** Routing **
watch(
	() => filters.value,
	(current) => {
		console.log(`REMOVEME updating query to `, current);
		router.push({ query: _.cloneDeep(filters.value) });
	},
	{ deep: true, immediate: true },
);
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
