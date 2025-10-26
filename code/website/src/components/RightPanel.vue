<script lang="ts" setup>
import { inject } from "vue";
import _ from "lodash";
import type { ProvidedExport } from "./State.vue";
import Course from "./Course.vue";

const { selectedState } = inject("state") as ProvidedExport;

const course = selectedState;
</script>
<template>
	<Course class="rhs" v-if="course" :code="course" type="summary" />
</template>
<style>
button.rhs:hover {
	background-color: inherit;
}
</style>
