import _ from "lodash";
import package_json from "../../package.json";
import { useStorage } from "@vueuse/core";
import { ref, reactive, watch } from "vue";
import * as semver from "semver";
import { toast } from "vue3-toastify";
import type { PlanState } from "./plan";
import { defaultPlanner } from "./planner";

export const current_version = package_json.version;
export const compatible_versions = `=${current_version}`;
export const debug = useStorage("debug", false);

export type PlanKey = string;
export type State = {
	version: string;
	current: PlanKey;
	plans: Record<PlanKey, PlanState>;
};

export function defaultPlan(num: number): PlanState {
	return _.cloneDeep({
		name: `Plan ${num}`,
		programId: null,
		topLevelReqsSelected: {},
		planner: defaultPlanner(),
	});
}

export const defaultState = (): State =>
	_.cloneDeep({
		version: current_version,
		current: "Plan 1",
		plans: {
			"Plan 1": {
				...defaultPlan(1),
				name: "My first plan",
			},
		},
	});

/** Course id (code) lowercase */
export const selectedState = ref(undefined as undefined | string);

const _localState = useStorage(`student-info`, reactive(defaultState()));
// export const localState = computed(() => _localState ?? defaultState);
export const localState = _localState;
export const hardResetLocalState = (errorMessage: string) => {
	console.warn(`Resetting all local state`, errorMessage);
	toast(errorMessage, { type: "error" });
	toast(`Your save has been hard reset because this is still an MVP`, {
		type: "warning",
	});
	localState.value = defaultState();
};

export const localStateAPI = {
	/** Returns vue proxy */
	getAll(): Record<PlanKey, PlanState> {
		const ret = localState.value?.plans;
		if (!ret) {
			hardResetLocalState(`[Internal Error] No plans found?`);
			return this.getAll();
		}
		return ret;
	},
};

// Aggressively purge out of date state
watch(
	() => localState.value.version,
	() => {
		if (
			!localState.value.version ||
			!semver.satisfies(localState.value.version, compatible_versions)
		) {
			hardResetLocalState(
				`Your previously saved plans aren't compatible anymore (previous version = ${localState.value.version}, current website version = ${current_version})`,
			);
		} else {
			console.info(
				`Version of ${localState.value.version} is compatible with the current version ${current_version}`,
			);
		}
	},
	{ deep: true, immediate: true },
);
