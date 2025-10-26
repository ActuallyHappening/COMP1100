import _ from "lodash";
import package_json from "../../package.json";
import { useStorage } from "@vueuse/core";
import { ref, reactive, watch } from "vue";
import * as semver from "semver";
import { toast } from "vue3-toastify";
import { Surreal, Table } from "surrealdb";
import { defaultPlan, type PlanState } from "./plan";
import { programs } from "./db/program";
import { courses } from "./db/course";
import { program_requirements } from "./db/program_requirement";

export const current_version = package_json.version;
export const compatible_versions = `=${current_version}`;
export const debug = useStorage("debug", false);

export type PlanKey = string;
export type State = {
	version: string;
	current: PlanKey;
	plans: Record<PlanKey, PlanState>;
};

export const defaultState = () =>
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
export const reset = () => {
	console.warn(`Resetting all local state`);
	toast(`Your save has been hard reset because this is still an MVP`, {
		type: "warning",
	});
	localState.value = defaultState();
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
