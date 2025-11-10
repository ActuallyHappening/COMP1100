<script setup lang="ts">
import { defineProps } from "vue";
const props = defineProps({
	err: { type: Object, default: undefined },
});
</script>
<template>
  <p class="text-danger">
    {{ props.err }}
  </p>
</template>
