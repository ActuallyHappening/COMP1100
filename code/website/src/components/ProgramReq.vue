<script lang="ts" setup>
import { reactive, inject, ref, watch } from "vue";
import type { ProvidedExport } from "./State.vue";
import type { ProgramRequirement } from "./State.vue";
import { RecordId } from "surrealdb";
import _ from "lodash";
// import { STATE } from "./State.vue";
const {
	debug,
	localState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
	getProgramRequirement,
} = inject("state") as ProvidedExport;
import { toast } from "vue3-toastify";

const props = defineProps({
	index: { type: Number, required: true },
});
const emit = defineEmits<{
	selected: [id: RecordId<string>];
}>();

const $debug = (...args) => console.info(props.index, ...args);
const allOptions = (): RecordId<string>[] | undefined => {
	const currentProgram = getCurrentProgram();
	if (!currentProgram) {
		toast(`Couldn't getCurrentProgram`, { type: "warning" });
		return undefined;
	}
	const ret = currentProgram.program_requirements[props.index];
	if (!ret) {
		toast(
			`Couldn't find index ${props.index} in current program_requirements`,
		);
	}
	return ret;
};
const allOptionsLoaded = (): ProgramRequirement[] | undefined => {
	return allOptions()
		?.map((id) => {
			const ret = getProgramRequirement(id);
			if (!ret) {
				console.error(
					`Couldn't find a program_requirement with id`,
					id,
				);
			}
			return ret;
		})
		.filter((req) => !!req);
};
const selectedRequirement = ref(undefined as undefined | RecordId<string>);
watch(selectedRequirement, () => {
	if (selectedRequirement.value) {
		emit("selected", selectedRequirement.value);
	}
});
// TODO: Convert back to record IDs
const chosenOption = (): string | undefined => {
	const _allOptions = new Set(
		allOptions().map((id) => id.id.toString()),
	) as Set<string>;
	const desiredRequirements = new Set(
		getCurrentPlanState().topLevelReqsSelected,
	);
	const chosen = _allOptions.intersection(desiredRequirements);
	if (chosen.size === 0) {
		// need to choose one
		if (_allOptions.size === 1) {
			// chose the only option
			const onlyOption = _allOptions.values().next().value!;
			$debug(`Chosing the only option available`, onlyOption);
			console.info(`debug value:`, _.cloneDeep(getCurrentPlanState()));
			getCurrentPlanState().topLevelReqsSelected.push(onlyOption);
			selectedRequirement.value = onlyOption;
			return onlyOption;
		} else {
			$debug(`need to choose`, _.cloneDeep(chosen));
			return undefined;
		}
	} else if (chosen.size === 1) {
		// already chosen
		$debug(`already chosen`, chosen);
		const alreadyChosen = chosen.values().next().value;
		selectedRequirement.value = alreadyChosen;
		return alreadyChosen;
	} else if (chosen.size === 2) {
		// chosen too many, remove all choices from user chosen to force them to reselect
		// this is a UX tradeoff
		$debug(`removing some choices`, chosen);
		getCurrentPlanState().topLevelReqsSelected = [
			...desiredRequirements.difference(chosen),
		];
		return undefined;
	}
};
const choseReq = () => {
	const chosen = selectedRequirement.value;
	if (!chosen) {
		return;
		throw new TypeError();
	}
	$debug(
		`Chosing`,
		chosen,
		// _.cloneDeep(getCurrentPlanState().programRequirementsSelected),
	);
	// remove conflicting choices, then add the current choice
	const __allOptions = allOptions();
	if (!__allOptions) throw TypeError();
	const _allOptions = new Set(
		__allOptions.map((option) => option.toString()),
	);
	if (!_allOptions) throw TypeError();

	const _chosen = new Set([chosen]);
	const current = new Set(getCurrentPlanState().topLevelReqsSelected);

	// current = current - (allOptions - chosen) + chosen
	getCurrentPlanState().topLevelReqsSelected = [
		...current.difference(_allOptions).union(_chosen),
	];
	// $debug(
	// 	`Chosen`,
	// 	chosen,
	// 	// _.cloneDeep(getCurrentPlanState().programRequirementsSelected),
	// );
};
watch(selectedRequirement, choseReq);
</script>

<template>
	<!-- <pre v-if="debug"> {{ index }}</pre> -->
	<!-- <pre v-if="debug"> {{ allOptions() }}</pre> -->
	<!-- <pre v-if="debug"> {{ allOptionsLoaded() }}</pre> -->
	<template v-if="chosenOption()"> </template>
	<select
		v-model="selectedRequirement"
		id="vue-ProgramReq"
		class="form-select"
	>
		<option value="" disabled hidden>Choose your major</option>
		<option
			v-for="option in allOptionsLoaded()"
			:key="option.id.toString()"
			:value="option.id.toString()"
		>
			{{ option.name }}
		</option>
	</select>
</template>
