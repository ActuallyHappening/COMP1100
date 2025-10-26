import type { RecordId } from "surrealdb";
import { ref } from "vue";

export type Program = {
	id: RecordId<string>;
	code: number;
	name: string;
	url: string;
	program_requirements: RecordId<string>[][];
};

export const programs = ref(null as Program[] | null);
