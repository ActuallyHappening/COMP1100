<script setup lang="ts">
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { ProvidedExport, Prereq, SemId } from "./State.vue";
import Course from "./Course.vue";
import { preresuisiteCheck } from "../prerequisiteChecker.ts";

const { sem_ids, selectedState, getCurrentPlanState, defaultPlanner } = inject(
	"state",
) as ProvidedExport;
const slots = ["Course 1", "Course 2", "Course 3", "Course 4"] as const;

/** Lowercase */
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
		const _planState = getCurrentPlanState();
		if (_planState) {
			console.info(sem_id, id, selectedState.value);
			_planState.planner[sem_id][id] = selectedState.value.toLowerCase();
			// preresuisiteCheck(sem_id, _planState.planner, selectedState.value);
			selectedState.value = undefined;
		}
	}
};
const getPlan = (sem_id: SemId, id: number): SemPlan[number] => {
	if (!getCurrentPlanState().planner[sem_id]) {
		getCurrentPlanState().planner[sem_id] = defaultPlanner()[sem_id];
	}
	return getCurrentPlanState().planner[sem_id][id];
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
				<th scope="row" :id="`${sem_id}`">{{ sem_id }}</th>
				<td v-for="id in slots.length" :id="`${sem_id}-${id}`">
					<button
						@click="placeCourse(sem_id, id)"
						v-if="!getPlan(sem_id, id)"
					>
						Place course here!
					</button>
					<Course v-else :code="getPlan(sem_id, id)!" type="small" />
				</td>
			</tr>
		</tbody>
	</table>
</template>
<style scoped>
table {
	width: 100%;
}
</style>
