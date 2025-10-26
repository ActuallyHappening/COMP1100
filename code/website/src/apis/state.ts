import package_json from "../../package.json";
import { useStorage } from "@vueuse/core";
import { computed, provide, onMounted, ref, reactive, watch } from "vue";
import _ from "lodash";
import * as semver from "semver";
import { toast } from "vue3-toastify";
import { defaultPlanner } from "../apis/planner";
import { RecordId, Surreal, Table, type RecordIdValue } from "surrealdb";
import type { Planner } from "./PlannerVisuals.vue";
import { router } from "../routes";

const current_version = package_json.version;
const compatible_versions = `=${current_version}`;
const debug = useStorage("debug", false);

export const defaultState = {
	version: current_version,
	current: "Plan 1",
	plans: {
		"Plan 1": {
			...defaultPlan(1),
			name: "My first plan",
		},
	},
};

/** Course id (code) lowercase */
export const selectedState = ref(undefined as undefined | string);

const _localState = useStorage(
	`student-info`,
	reactive(_.cloneDeep(defaultState)),
);
// export const localState = computed(() => _localState ?? defaultState);
export const localState = _localState;
export const reset = () => {
	console.warn(`Resetting all local state`);
	toast(`Your save has been hard reset because this is still an MVP`, {
		type: "warning",
	});
	localState.value = _.cloneDeep(defaultState);
};
// Aggressively purge out of date state
watch(
	localState,
	() => {
		if (
			!localState.value.version ||
			!semver.satisfies(localState.value.version, compatible_versions)
		) {
			console.warn(
				`Hard resetting local state because old version ${localState.value.version} doesn't satisfy ${compatible_versions} (currently ${current_version})`,
			);
			reset();
		} else {
			console.info(
				`Version of ${localState.value.version} is compatible with the current version ${current_version}`,
			);
		}
	},
	{ deep: true, immediate: true },
);

const getCurrentPlanState = (): PlanState => {
	const ret = localState.value?.plans?.[localState.value.current];
	if (!ret) {
		toast(`Major error, resetting state`, { type: "error" });
		reset();
		return getCurrentPlanState();
	}
	return ret;
};

export function refresh() {
	const db = new Surreal();
	return Promise.resolve()
		.then(() => {
			return db.connect(
				"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
				{
					namespace: "comp1100",
					database: "master",
					// guest auth
				},
			);
		})
		.then(() =>
			Promise.all([
				db
					.select(new Table("program"))
					.then((data) => (programs.value = data as any)),
				db
					.select(new Table("course"))
					.then((data) => (courses.value = data as any)),
				db
					.select(new Table("program_requirement"))
					.then((data) => (program_requirements.value = data as any)),
			]),
		)
		.catch((err) => {
			const error = new Error(`Failed to load data from the database`, {
				cause: err,
			});
			console.error(error);
			toast(error.message, { type: "error" });
		})
		.then(() => {
			console.info(`Successfully loaded all information from the db:`);
			console.info(`programs`, _.cloneDeep(programs.value));
			console.info(`courses`, _.cloneDeep(courses.value));
			console.info(
				`program_requirement`,
				_.cloneDeep(program_requirements.value),
			);
		});
}
