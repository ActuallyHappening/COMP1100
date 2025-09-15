import { useStorage } from "@vueuse/core";

export const state = useStorage(`student-info`, {
	studentNumber: null,
	programCode: null,
	plan: null,
});

export const oldState = useStorage(`old-student-info`, {
	studentNumber: null,
	programCode: null,
	plan: null,
});
