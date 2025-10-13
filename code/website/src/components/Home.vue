<script setup lang="ts">
import { reactive, inject } from "vue";
import type { ProvidedExport } from "./State.vue";
import ProgramReq from "./ProgramReq.vue";
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
</script>

<template>
	<!-- Top bar for plans  -->
	<div id="header" class="container-fluid m-auto">
		<div class="row purple-bg">
			<div class="col-3">
				<h1>UQ Planit</h1>
			</div>
			<div class="col-6 text-center align-content-center">
				<!-- Editable title but difficult to communicate, I think an edit symbol that is overlayed but disappears when editing would be ideal -->
				<h2>
					<input
						type="text"
						id="plan-name"
						v-model="planState().name"
						class="border-0 purple-bg text-center"
					/>
				</h2>
			</div>
			<div class="col-2 text-end align-content-center">
				<select
					name="plan-current"
					id="plan-current"
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
				<button class="btn" @click="newPlan">New Plan</button>
			</div>
		</div>
	</div>

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

	<div class="container-fluid">
		<form action="#" @submit.prevent="() => {}">
			<div class="input-group">
				<span class="input-group-text">Year</span>
				<input type="number" class="input-group-text" placeholder="2025" disabled>
				<span class="input-group-text">Course</span>
				<select
					class="form-select"
					name="course-code"
					id="course-code"
					:value="planState().programId"
					@input="
						($event) => (planState().programId = $event.target.value)
					"
				>
					<option value="">Please select a course</option>
					<option v-for="program in programs" :value="program.id">
						{{ program.name }}
					</option>
				</select>
				<span class="input-group-text">Major</span>
				<select
					name="major-code"
					id="major-code"
					:value="planState().majorId"
					@input="
						($event) => (planState().majorId = $event.target.value)
					"
				>
				<option value="">Please select a major</option>
				<option v-for="major in program_requirements" :value="major.id">
					{{ major.name }}
				</option>
				</select>
			</div>
		</form>
	</div>

	<!-- Horizontal bar for majors -->
	<form action="#" @submit.prevent="() => {}">
		<fieldset>
			<!-- v-model="planState().programId" -->
			<select
				name="course-code"
				id="course-code"
				:value="planState().programId"
				@input="
					($event) => (planState().programId = $event.target.value)
				"
			>
				<option value="">Please select a course</option>
				<option v-for="program in programs" :value="program.id">
					{{ program.name }}
				</option>
			</select>
			<select
				name="major-code"
				id="major-code"
				:value="planState().majorId"
				@input="
					($event) => (planState().majorId = $event.target.value)
				"
			>
			<option value="">Please select a major</option>
			<option v-for="major in program_requirements" :value="major.id">
				{{ major.name }}
			</option>
			</select>
		</fieldset>
	</form>
	<h1>Hello world!</h1>

	<!-- Top level program_requirement picker, e.g. between type: maj, and type: nomaj -->
	<ProgramReq
		v-for="(reqlist, index) in getCurrentProgram()?.program_requirements"
		:key="!reqlist[0] ? undefined : reqlist[0].id.toString()"
		:index="index"
	/>

	<div class="container">
		<div id="div_1">
			<h1>This is where the courses for selection will be placed</h1>
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
	</div>
</template>

<style scoped>
.purple-bg { /* Change to UQ colours pls */
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
