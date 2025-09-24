<script setup lang="ts">
import { reactive } from "vue";
import { localState, planState, programs } from "../state";
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
			<option v-for="plan in Object.keys(localState.plans)" :value="plan">
				{{ localState.plans[plan].name }}
			</option>
		</select>
	</div>

	<!-- Horizontal bar for majors -->
	<form action="#" @submit.prevent="() => {}">
		<fieldset>
			<!-- v-model="planState().programId" -->
			<select
				name="major-code"
				id="major-code"
				:value="planState().programId"
				@input="($event) => {console.log($event);  planState().programId = $event.target.value}"
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
