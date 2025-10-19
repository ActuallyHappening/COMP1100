<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps({
	err: Object,
});
</script>
<template>
	<p class="text-danger">{{ props.err }}</p>
</template>
