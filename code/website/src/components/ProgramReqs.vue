<script lang="ts" setup>
import { reactive, inject, ref, watch } from "vue";
import type { ProvidedExport } from "./State.vue";
import type { ProgramRequirement } from "./State.vue";
import _ from "lodash";
const {
	debug,
	localState,
	getCurrentPlanState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
} = inject("state") as ProvidedExport;

const props = defineProps({
	index: { type: Number, required: true },
});

const $debug = (...args) => console.info(props.index, ...args);
const allOptions = (): RecordId<string>[] | undefined =>
	getCurrentProgram()?.program_requirements[props.index];
const allOptionsLoaded = (): ProgramRequirement[] | undefined => {
	return allOptions()?.map((id) => {
		const ret = program_requirements.value.find(
			(req) => req.id.toString() === id.toString(),
		);
		if (!ret) {
			console.error(`Couldn't find a program_requirement with id`, id);
		}
		return ret;
	});
};
const selectedRequirement = ref("" as string);
const chosenOption = (): string | undefined => {
	const _allOptions = new Set(allOptions().map((id) => id.toString()));
	const desiredRequirements = new Set(
		getCurrentPlanState().programRequirementsSelected,
	);
	const chosen = _allOptions.intersection(desiredRequirements);
	if (chosen.size === 0) {
		// need to choose one
		if (_allOptions.size === 1) {
			// chose the only option
			const onlyOption = _allOptions.values().next().value;
			$debug(`Chosing the only option available`, onlyOption);
			getCurrentPlanState().programRequirementsSelected.push(onlyOption);
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
		getCurrentPlanState().programRequirementsSelected = [
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
	const current = new Set(getCurrentPlanState().programRequirementsSelected);

	// current = current - (allOptions - chosen) + chosen
	getCurrentPlanState().programRequirementsSelected = [
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
	<select v-model="selectedRequirement">
		<option value="" disabled>Choose your major</option>
		<option
			v-for="option in allOptionsLoaded()"
			:key="option.id.toString()"
			:value="option.id.toString()"
		>
			{{ option.name }}
		</option>
	</select>
</template>
