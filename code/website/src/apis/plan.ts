import { toast } from "vue3-toastify";
import { defaultPlanner, type Planner } from "./planner";
import { localState, reset } from "./state";
import _ from "lodash";

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

export const defaultPlan = (num: number) =>
	_.cloneDeep({
		name: `Plan ${num}`,
		programId: null,
		topLevelReqsSelected: {},
		planner: defaultPlanner(),
	});

export const planAPI = {
	getAll(): PlanState {
		const ret = localState.value?.plans;
		if (!ret) {
			toast(`[Internal Error] No plans found?`, { type: "error" });
			reset();
			return this.getAll();
		}
		return ret;
	},
	getCurrent() {},
};

// every time the program changes, reset the top level req chosen
watch(
	() => getCurrentPlanState().programId,
	(current, old) => {
		console.warn(
			`Resetting topLevelReqsSelected because the programId has changed from ${old} to ${current}`,
		);
		getCurrentPlanState().topLevelReqsSelected = {};
	},
);
