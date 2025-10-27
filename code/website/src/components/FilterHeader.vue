<script lang="ts" setup>
import { filters, filterAPI } from "../apis/filter";
</script>
<template>
	<div class="input-group">
		<span class="input-group-text" for="top-level-search">Search for courses:</span>
		<input class="form-control" type="search" id="top-level-search" v-model="filters.search" />

		<fieldset>
			<legend>Semesters offered:</legend>
		</fieldset>
		<span class="input-group-text" for="top-level-sem-1">Sem 1:</span>
		<div class="input-group-text">
			<input class="form-check-input" type="checkbox" v-model="filters.sem_1" />
		</div>
		<span class="input-group-text" for="top-level-sem-2">Sem 2:</span>
		<div class="input-group-text">
			<input class="form-check-input" type="checkbox" v-model="filters.sem_2" />
		</div>
		<span class="input-group-text" for="top-level-sem-summer">Sem Summer:</span>
		<div class="input-group-text">
			<input class="form-check-input" type="checkbox" v-model="filters.sem_summer" />
		</div>

		<button class="btn btn-outline-secondary" @click="filterAPI.clear">Clear Filters</button>
	</div>
</template>
