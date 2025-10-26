<script setup lang="ts">
import { inject, defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import type { ProvidedExport, Prereq, SemId } from "./State.vue";
import Course from "./Course.vue";
import { RecordId } from "surrealdb";

const { sem_ids, selectedState, getCurrentPlanState, plannerAPI } = inject(
	"state",
) as ProvidedExport;
const placeCourse = (sem_id: SemId, id: number) => {
	if (selectedState.value) {
		const planState = getCurrentPlanState();
		plannerAPI(planState.planner).assignNewCourse(
			[sem_id, id],
			new RecordId("course", selectedState.value.toLowerCase()),
		);
		selectedState.value = undefined;
	}
};
const getPlan = (sem_id: SemId, id: number): SemPlan[number] => {
	return plannerAPI(getCurrentPlanState().planner).getIndex([sem_id, id]);
};
</script>
<template>
	<table class="table table-bordered">
		<thead>
			<tr>
				<th scope="col" style="width: 10%;"></th>
				<th scope="col" style="width: 20%;" v-for="id in slots">{{ id }}</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="sem_id in sem_ids">
				<th scope="row" :id="`${sem_id}`">{{ sem_id }}</th>
				<td v-for="(name, id) in slots.length" :id="`${sem_id}-${id}`">
					<button
						class="btn btn-outline-primary p-5"
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

.btn-outline-primary {
	--bs-btn-color: black;
	--bs-btn-border-color: #51247A;
	--bs-btn-hover-bg: #51247A;
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-border-color: #51247A;
	--bs-btn-active-bg: #51247A;
	--bs-btn-active-border-color: #51247A;
	--bs-btn-focus-shadow-rgb: 81, 36, 122;
	width: 100%;
}

.btn-outline-primary:focus {
	outline-color: #51247A;
}

</style>
