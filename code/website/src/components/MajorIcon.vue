<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
	type: {
		required: true,
		default: "core",
	},
});

const type = computed(() => {
	if (props.type) {
	}
});
</script>
