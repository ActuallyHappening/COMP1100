<script setup lang="ts">
import { reactive, inject, computed } from "vue";
import type { ProvidedExport } from "./State.vue";
import ProgramReq from "./ProgramReq.vue";
import ProgramReqs from "./ProgramReqs.vue";
// import { STATE } from "./State.vue";
const {
	localState,
	planState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
} = inject("state") as ProvidedExport;

function newPlan() {
	const planNums = Object.keys(localState.value.plans).map((planString) =>
		Number(planString.slice(5)),
	);
	const max = Math.max(...planNums);
	const newNum = max + 1;
	const newPlan = `Plan ${newNum}`;
	localState.value.plans[newPlan] = defaultPlan(newNum);
	localState.value.current = newPlan;
}

const top_level_selected = reactive({} as { [key: number]: string });
</script>

<template>
	<!-- Top bars for plans  -->
	<div id="header" class="container-fluid m-auto">
		<div class="row purple-bg">
			<div class="col-3">
				<h1>UQ Planit</h1>
			</div>
			<div class="col-6 text-center align-content-center">
				<h2>
					<input
						type="text"
						id="plan-name"
						v-model="planState().name"
						class="border-0 purple-bg text-center"
					/>
					<!-- Would appreciate if this input could be dynamically scaled -->
					<label for="plan-name"><span>✎</span></label>
				</h2>
			</div>
			<div class="col-2 text-end align-content-center">
				<select
					name="plan-current"
					id="plan-current"
					class="form-select"
					v-model="localState.current"
				>
					<option
						v-for="plan in Object.keys(localState.plans)"
						:value="plan"
					>
						{{ localState.plans[plan].name }}
					</option>
				</select>
			</div>
			<div class="col-1 align-content-center">
				<button class="btn btn-primary w-100" @click="newPlan">
					New Plan
				</button>
			</div>
		</div>
	</div>

	<!--
	<div class="container-fluid">
		<label for="plan-name">Plan name:</label>
		<input type="text" id="plan-name" v-model="planState().name" />
		<select
			name="plan-current"
			id="plan-current"
			v-model="localState.current"
		>
			<option v-for="plan in Object.keys(localState.plans)" :value="plan">
				{{ localState.plans[plan].name }}
			</option>
		</select>
		<button class="btn" @click="newPlan">New Plan</button>
	</div>
	-->

	<div class="container-fluid p-0">
		<form action="#" @submit.prevent="() => {}">
			<div class="input-group">
				<span class="input-group-text">Year</span>
				<input
					type="number"
					class="input-group-text"
					placeholder="2025"
					disabled
				/>
				<span class="input-group-text">Course</span>
				<select
					class="form-select"
					name="course-code"
					id="course-code"
					:value="planState().programId"
					@input="
						($event) =>
							(planState().programId = $event.target.value)
					"
				>
					<option value="" hidden>Please select a course</option>
					<option v-for="program in programs" :value="program.id">
						{{ program.name }}
					</option>
				</select>
			</div>
		</form>
	</div>


	<div class="container-fluid row">
		<div class="col-4">
			<!-- Top level program_requirement picker, e.g. between type: maj, and type: nomaj -->
			<div
				v-for="(reqlist, index) in getCurrentProgram()
					?.program_requirements"
				:key="!reqlist[0] ? undefined : reqlist[0].id.toString()"
			>
				<ProgramReq
					:index="index"
					@selected="(req) => (top_level_selected[index] = req)"
				/>
				<ProgramReqs
					:requirement-id="top_level_selected[index]"
					v-if="top_level_selected[index]"
				/>
			</div>
		</div>
		<div class="col-7" id="plan">
			 plan

		</div>
	</div>

	<!--<div class="container">
		<div id="div_1">
			<h1>This is where the courses for selection will be placed</h1>
			<div
				v-for="(reqlist, index) in getCurrentProgram()
					?.program_requirements"
				:key="!reqlist[0] ? undefined : reqlist[0].id.toString()"
			>
				<ProgramReq
					:index="index"
					@selected="(req) => (top_level_selected[index] = req)"
				/>
				<ProgramReqs
					:requirement-id="top_level_selected[index]"
					v-if="top_level_selected[index]"
				/>
			</div>
		</div>
		<div id="div_2">
			<h1>This is where the courses will be placed</h1>
			<div class="container">
				<h2 id="div_3">Semester 1</h2>
			</div>
			<div class="container">
				<h2 id="div_4">Semester 2</h2>
			</div>
		</div>
	</div>-->
</template>

<style scoped>
.purple-bg {
	/* Change to UQ colours pls */
	background-color: mediumpurple;
}
/* Temp styling for proof of concept */
.container {
	display: flex;
	width: 100%;
	align-items: center;
	margin: 0;
}

#div_1 {
	background-color: firebrick;
	width: 33%;
}

#div_2 {
	background-color: #51247a;
	flex-grow: 1;
}

#div_3 {
	background-color: pink;
	width: 100%;
}

#div_4 {
	background-color: navajowhite;
	width: 100%;
}
</style>
