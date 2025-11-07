<script setup lang="ts">
import Course from "./Course.vue";
import { RecordId } from "surrealdb";
import { selectedState } from "../apis/state";
import { planAPI } from "../apis/plan";
import {
	plannerAPI,
	type SemPlan,
	type SemId,
	slots,
	sem_ids,
} from "../apis/planner";
import { programAPI } from "../apis/db/program";

let counter = 0;
const required = (programAPI.getCurrent().required_cp)/8;
let sem_idss = sem_ids.filter((sem_id) => {
	if (counter < required) {
		counter += 1
		return true;
	}
	return false;
});

const placeCourse = (sem_id: SemId, id: number) => {
	if (selectedState.value) {
		const planState = planAPI.getCurrent();
		plannerAPI(planState.planner).assignNewCourse(
			[sem_id, id],
			new RecordId("course", selectedState.value.toLowerCase()),
		);
		selectedState.value = undefined;
		let sems = Object.keys(planAPI.getCurrent().planner);
		for (const c in sems) {
			const divName = sems[c]?.toString();
			const divItem = document.getElementById(divName);
			if (divItem) {
				divItem.classList.remove("prereq-success");
				divItem.classList.remove("prereq-fail");
				divItem.classList.remove("prereq-unavailable");
				const headerRow = divItem.parentElement;
				const tds = Array.from(headerRow?.querySelectorAll("td"));
				for (const td in tds) {
					const buttons = Array.from(
						tds[td]?.querySelectorAll("button"),
					);
					for (const button in buttons) {
						buttons[button]?.classList.remove("disabled");
					}
				}
			}
		}
	}
};
const getPlan = (sem_id: SemId, id: number): SemPlan[number] => {
	return plannerAPI(planAPI.getCurrent().planner).getIndex([sem_id, id]);
};

const applyClass = (sem_id: SemId) => {
	let semester = sem_id.split(" ");
	if (semester[2] === "2") {
		return "gray-row";
	} else {
		return;
	};
};
</script>
<template>
	<table class="table table-bordered" id="mainTable">
		<thead>
			<tr>
				<th scope="col" style="width: 10%"></th>
				<th scope="col" style="width: 20%" v-for="id in slots">
					{{ id }}
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="sem_id in sem_idss" :id="`row-${sem_id}`" :class="applyClass(sem_id)">
				<th scope="row" :id="`${sem_id}`">{{ sem_id }}</th>
				<td v-for="(_name, id) in slots.length" :id="`${sem_id}-${id}`">
					<button
						class="btn btn-outline-secondary pt-5 pb-5"
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

th,
td {
	border: none;
}

thead th {
	text-align: center;
}

th {
	text-align: right;
	border-radius: 10px;
	transition: background-color 0.5s ease-in-out;
	background-color: white;
}

.prereq-success {
	background-color: #B2FBA5;
}

.prereq-fail {
	background-color: #B2FBA5;
}

table {
	border-color: white;
}

.prereq-unavailable {
	background-color: #ff746c;
	color: white;
}

.incompatible-true {
	background-color: #ff746c;
}

.btn-outline-secondary {
	--bs-btn-color: black;
	--bs-btn-border-color: #51247a;
	--bs-btn-hover-bg: #51247a;
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-border-color: #51247a;
	--bs-btn-active-bg: #51247a;
	--bs-btn-active-border-color: #51247a;
	--bs-btn-focus-shadow-rgb: 81, 36, 122;
	width: 100%;
}

.btn-outline-secondary:focus {
	outline-color: #51247a;
}

tr.gray-row td {
	background-color: lavender;
}
</style>
