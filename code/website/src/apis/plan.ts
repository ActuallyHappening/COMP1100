import _ from "lodash";
import { toast } from "vue3-toastify";
import { defaultPlanner, type Planner } from "./planner";
import {
	localState,
	hardResetLocalState,
	defaultPlan,
	type PlanKey,
} from "./state";
import { watch } from "vue";

export { defaultPlan };

export type PlanState = {
	name: string;
	programId: string | null;
	/**
	 * The program_requirements selected for each required top level slot
	 * in the user's degree, e.g. their major.
	 * Uses string id field for serialization
	 */
	topLevelReqsSelected: { [key: number]: string | undefined };
	planner: Planner;
};

export const planAPI = {
	/** Returns vue proxy */
	getCurrent(): PlanState {
		const current = localState.value.current;
		const all = this.getAll();
		if (!all[current]) {
			hardResetLocalState(`Find plan ${current}, resetting`);
			return this.getCurrent();
		}
		return all[current];
	},
};

// every time the program changes, reset the top level req chosen
watch(
	() => planAPI.getCurrent().programId,
	(current, old) => {
		console.warn(
			`Resetting topLevelReqsSelected because the programId has changed from ${old} to ${current}`,
		);
		planAPI.getCurrent().topLevelReqsSelected = {};
	},
);
