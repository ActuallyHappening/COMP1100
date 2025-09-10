import { useStorage } from "@vueuse/core";

export const state = useStorage(`student-info`, {
	studentNumber: null,
	programCode: null,
	plan: null,
});
