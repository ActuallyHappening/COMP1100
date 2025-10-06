<script setup lang="ts">
import { reactive, inject } from "vue";
import { STATE } from "./State.vue";
const { localState, planState, programs, defaultPlan } = inject(STATE);

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
	<div class="container-fluid">
		<label for="plan-name">Plan name:</label>
		<input type="text" id="plan-name" v-model="planState().name" />
		<select
			name="plan-current"
			id="plan-current"
			v-model="localState.current"
		>
			<option
				v-for="plan in Object.keys((localState ?? defaultState).plans)"
				:value="plan"
			>
				{{ localState.plans[plan].name }}
			</option>
		</select>
		<button class="btn" @click="newPlan">New Plan</button>
	</div>

	<!-- Horizontal bar for majors -->
	<form action="#" @submit.prevent="() => {}">
		<fieldset>
			<!-- v-model="planState().programId" -->
			<select
				name="major-code"
				id="major-code"
				:value="planState().programId"
				@input="
					($event) => (planState().programId = $event.target.value)
				"
			>
				<option value="">Please select a major</option>
				<option v-for="program in programs" :value="program.id">
					{{ program.name }}
				</option>
			</select>
		</fieldset>
	</form>
	<h1>Hello world!</h1>
</template>
