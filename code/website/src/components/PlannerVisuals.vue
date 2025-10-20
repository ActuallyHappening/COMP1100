<script setup lang="ts">
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { ProvidedExport, Prereq, SemId } from "./State.vue";
import Course from "./Course.vue";

const { sem_ids, selectedState, planState } = inject("state") as ProvidedExport;
const slots = ["Course 1", "Course 2", "Course 3", "Course 4"];

export type SemPlan = [
	string | undefined,
	string | undefined,
	string | undefined,
	string | undefined,
];
export type Planner = {
	[key in SemId]: SemPlan;
};
const placeCourse = (sem_id: SemId, id: number) => {
	if (selectedState.value) {
		const _planState = planState();
		if (_planState) {
			console.info(sem_id, id, selectedState.value);
			_planState.planner[sem_id][id] = selectedState.value;
			selectedState.value = undefined;
		}
	}
};
const getPlan = (sem_id: SemId, id: number) => {
	return planState()?.planner?.[sem_id]?.[id];
};
</script>
<template>
	<table class="table table-bordered">
		<thead>
			<tr>
				<th scope="col"></th>
				<th scope="col" v-for="id in slots">{{ id }}</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="sem_id in sem_ids">
				<th scope="row">{{ sem_id }}</th>
				<td v-for="id in slots">
					<button
						@click="placeCourse(sem_id, id)"
						v-if="!getPlan(sem_id, id)"
					>
						Place course here!
					</button>
					<Course v-else :code="getPlan(sem_id, id)" small />
				</td>
			</tr>
		</tbody>
	</table>
</template>
