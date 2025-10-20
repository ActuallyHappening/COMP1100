<script setup lang="ts">
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { Course, ProvidedExport, Prereq, SemId } from "./State.vue";

const { sem_ids, selectedState } = inject("state") as ProvidedExport;

export type SemPlan = [
	string | undefined,
	string | undefined,
	string | undefined,
	string | undefined,
];
export type Planner = {
	[key in SemId]: SemPlan;
};
</script>
<template>
	<table class="table">
		<thead>
			<tr>
				<th scope="col">#</th>
				<th scope="col">1</th>
				<th scope="col">2</th>
				<th scope="col">3</th>
				<th scope="col">4</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="sem_id in sem_ids">
				<th scope="row">{{ sem_id }}</th>
				<td></td>
			</tr>
		</tbody>
	</table>
</template>
