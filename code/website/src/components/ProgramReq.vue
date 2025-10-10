<script lang="ts" setup>
import { reactive, inject } from "vue";
import type { ProvidedExport } from "./State.vue";
// import { STATE } from "./State.vue";
const {
	debug,
	localState,
	planState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
} = inject("state") as ProvidedExport;

const props = defineProps({
	index: { type: Number },
});
</script>

<template>
	<pre v-if="debug"> {{ index }}</pre>
	<h3>Major / Core / No major</h3>
</template>
