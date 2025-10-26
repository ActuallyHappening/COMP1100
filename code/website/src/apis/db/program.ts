import { RecordId } from "surrealdb";
import { ref } from "vue";
import { toast } from "vue3-toastify";
import { id_eq } from "../db";
import { planAPI } from "../plan";
import { hardResetLocalState } from "../state";

export type Program = {
	id: RecordId<string>;
	code: number;
	name: string;
	url: string;
	program_requirements: RecordId<string>[][];
};

export const programs = ref(null as Program[] | null);

export const programAPI = {
	getAll(): Program[] | null {
		const ret = programs.value;
		if (!ret) {
			toast(`Haven't retrieved programs yet`, { type: "info" });
		}
		return ret;
	},
	get(id: RecordId<string>): Program | undefined {
		const all = this.getAll();
		if (!all) {
			return;
		}

		const ret = all.find((program) => id_eq(program.id, id));
		if (!ret) {
			toast(`Program with id ${id} not found`, { type: "warning" });
		}
		return ret;
	},
	getOrError(id: RecordId<string>): Program {
		const program = this.get(id);
		if (!program) {
			throw new Error(`Program with id ${id} not found`);
		}
		return program;
	},
	getCurrent(): Program | null {
		const plan = planAPI.getCurrent();
		const id = plan.programId;
		// use hasn't selected their program yet
		if (id === null) {
			return null;
		}
		const program = this.get(new RecordId("program", id));
		if (!program) {
			// TODO: Maybe we should refresh here instead of resetting local state?
			// https://github.com/COMP1100-7110-2025-s2/Mon_9am_Team_10/issues/29
			hardResetLocalState(`Program with id ${id} not found in local state`);
			return this.getCurrent();
		}
		return program;
	},
};
