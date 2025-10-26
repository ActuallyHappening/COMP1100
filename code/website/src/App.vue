<script setup lang="ts">
import { localState } from "./apis/state";
import State from "./components/State.vue";
</script>

<template>
	<main>
		<State>
			<RouterView />
		</State>
	</main>
</template>

<style scoped></style>
