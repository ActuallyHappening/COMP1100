<script setup lang="ts">
import { reactive } from "vue";
import { localState, programs } from "../state";
</script>

<template>
	<!-- Top bar for plans  -->
	<div class="container-fluid">
		<label for="plan-name">Plan name:</label>
		<input
			type="text"
			id="plan-name"
			v-model="localState[localState.current].name"
		/>
	</div>

	<!-- Horizontal bar for majors -->
	<form action="#" @submit.prevent="() => {}">
		<fieldset>
			<select
				name="major-code"
				id="major-code"
				v-model="localState[localState.current].programId"
			>
				<option v-for="program in programs" :value="program.id">
					{{ program.name }}
				</option>
			</select>
		</fieldset>
	</form>
	<h1>Hello world!</h1>
</template>
