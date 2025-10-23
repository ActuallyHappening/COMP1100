<script setup lang="ts">
import { reactive, inject, computed, useTemplateRef, watch, ref } from "vue";
import type { ProvidedExport } from "./State.vue";
import ProgramReq from "./ProgramReq.vue";
import ProgramReqs from "./ProgramReqs.vue";
import PlannerVisuals from "./PlannerVisuals.vue";
import RightPanel from "./RightPanel.vue";
import { RecordId } from "surrealdb";
import _ from "lodash";
import * as bootstrap from "bootstrap";
// import { STATE } from "./State.vue";
const {
	localState,
	programs,
	getCurrentProgram,
	defaultPlan,
	requirement_types_to_header,
	requirement_type_to_header,
	getProgramRequirement,
	getCurrentPlanState,
} = inject("state") as ProvidedExport;

function newPlan() {
	// "Plan 42069" -> Number(42069) + 1
	const planNums = Object.keys(localState.value.plans).map((planString) =>
		Number(planString.slice(5)),
	);
	const max = Math.max(...planNums);
	const newNum = max + 1;
	const newPlan = `Plan ${newNum}`;

	localState.value.plans[newPlan] = defaultPlan(newNum);
	localState.value.current = newPlan;
}

function courseChange(event: Event) {
	const value = (event.target as HTMLSelectElement).value;
	const plan_state = getCurrentPlanState();
	if (plan_state) {
		plan_state.programId = value;
	}
}

const getHeaderByIndex = (index: number): string | undefined => {
	const me_req = getCurrentPlanState().topLevelReqsSelected[index];
	// if a specific req is already selected
	if (typeof me_req === "string") {
		return requirement_type_to_header(
			getProgramRequirement(new RecordId("program_requirement", me_req))
				.type,
		);
	}
	// otherwise, a summary e.g. "Major | No Major | Extended Major"
	const currentProgram = getCurrentProgram();
	if (!currentProgram) {
		return undefined;
	}
	const a = currentProgram.program_requirements[index]
		?.map((req_id) => getProgramRequirement(req_id))
		.map((req) => req.type);
	return requirement_types_to_header(a);
};
const normalize = (str: string | undefined): string => {
	return (
		(str ?? "UNDEFINED")
			.toLowerCase()
			// pasted from claude https://claude.ai/chat/a6a9877e-b767-4173-bc62-da13870b7524
			.replace(/[^a-zA-Z0-9\s]/g, "")
			.replace(/\s+/g, "-")
	);
};
const normalizedIndexHeaders = computed((): string[] => {
	const ret: string[] = [];
	const currentProgram = getCurrentProgram();
	if (!currentProgram) {
		return [];
	}
	for (const idx in currentProgram.program_requirements) {
		const i = Number(idx);
		ret[i] = normalize(getHeaderByIndex(i));
	}
	return ret;
});

// Vue tab impl
const selectedIndex = ref(0);
const tabRefs = useTemplateRef("tabs");
watch(
	tabRefs,
	(refs) => {
		refs?.forEach((el) => {
			el.bsTabTrigger = new bootstrap.Tab(el);
			// console.info(el, el.bsTabTrigger);
		});
	},
	{ immediate: true },
);
const tabClicked = (event: Event, i: number) => {
	event.preventDefault();
	selectedIndex.value = i;
	// event.target?.bsTabTrigger?.show();
};
</script>

<template>
	<!-- Top bars for plans  -->
	<div id="header" class="container-fluid m-auto">
		<div class="row purple-bg">
			<div class="col-3">
				<h1>UQ Planit</h1>
			</div>
			<div class="col-6 text-center align-content-center">
				<h2>
					<input
						type="text"
						id="plan-name"
						v-model="getCurrentPlanState().name"
						class="border-0 purple-bg text-center"
					/>
					<!-- Would appreciate if this input could be dynamically scaled -->
					<label for="plan-name"><span>✎</span></label>
				</h2>
			</div>
			<div class="col-2 text-end align-content-center">
				<select
					name="plan-current"
					id="plan-current"
					class="form-select"
					v-model="localState.current"
				>
					<option
						v-for="plan in Object.keys(localState.plans)"
						:value="plan"
					>
						{{ localState.plans[plan].name }}
					</option>
				</select>
			</div>
			<div class="col-1 align-content-center">
				<button class="btn btn-outline-primary w-100" @click="newPlan">
					New Plan
				</button>
			</div>
		</div>
	</div>

	<div class="container-fluid p-0">
		<form action="#" @submit.prevent="() => {}">
			<div class="input-group">
				<span class="input-group-text">Year</span>
				<input
					type="number"
					class="input-group-text"
					placeholder="2025"
					disabled
				/>
				<span class="input-group-text">Course</span>
				<select
					class="form-select"
					name="course-code"
					id="course-code"
					:value="getCurrentPlanState().programId"
					@input="courseChange"
				>
					<option value="" hidden>Please select a course</option>
					<option v-for="program in programs" :value="program.id">
						{{ program.name }}
					</option>
				</select>
				<span class="input-group-text">Major</span>
				<!-- Hardcoding the first index as the major
				Trakcking issue: https://github.com/COMP1100-7110-2025-s2/Mon_9am_Team_10/issues/17
				-->
				<ProgramReq
					v-if="getCurrentProgram()?.program_requirements?.[1]"
					:index="1"
				/>
				<select v-else class="form-select" disabled></select>
			</div>
		</form>
	</div>

	<div class="container-fluid row" id="parent-div">
		<div class="col-3 left-panel" v-if="getCurrentProgram()">
			<div class="nav nav-tabs" id="nav-tab" role="tablist">
				<button
					v-if="getCurrentProgram()"
					v-for="(id, i) in normalizedIndexHeaders"
					ref="tabs"
					:key="id"
					class="nav-link"
					:class="{ active: i == selectedIndex }"
					:id="`homescreen-leftbar-${id}-tab`"
					data-bs-toggle="tab"
					:data-bs-target="`#homescreen-leftbar-${id}-tabcontent`"
					type="button"
					role="tab"
					:aria-controls="`#homescreen-leftbar-${id}-tabcontent`"
					aria-selected="true"
					@click="(ev) => tabClicked(ev, i)"
				>
					{{ getHeaderByIndex(i) }}
				</button>
			</div>
			<div class="tab-content" id="nav-tabContent">
				<template v-for="(id, i) in normalizedIndexHeaders" :key="id">
					<div
						v-show="i === selectedIndex"
						class="tab-pane fade show"
						:class="{ active: i == selectedIndex }"
						:id="`homescreen-leftbar-${id}-tabcontent`"
						role="tabpanel"
						:aria-labelledby="`homescreen-leftbar-${id}-tab`"
						tabindex="0"
					>
						{{ getHeaderByIndex(i) }}
						<ProgramReq :index="i" />
						<ProgramReqs
							v-if="getCurrentPlanState().topLevelReqsSelected[i]"
							:requirement-id="
								getCurrentPlanState().topLevelReqsSelected[i]!
							"
						/>
					</div>
				</template>
			</div>
		</div>
		<div class="col-7" id="plan">
			<PlannerVisuals />
		</div>
		<div class="col-2">
			<RightPanel />
		</div>
	</div>
</template>

<style scoped>
.purple-bg {
	background-color: #51247a;
	color: white;
	padding: 5px;
}
#nav-tab {
	display: flex;
	white-space: nowrap;
	overflow-y: hidden;
	overflow-x: auto;
	flex-wrap: nowrap;
	overflow: hidden;
	mask-image: linear-gradient(
		to right,
		transparent,
		black 20px,
		/* Start solid black after 20px from left */ black calc(100% - 20px),
		/* End solid black 20px from right */ transparent
			/* Fade to transparent at the right edge */
	);
}

.tababble:hover {
	overflow-x: auto;
}

button.nav-link {
	color: gray;
}

button.nav-link:hover {
	color: black;
}

button.active {
	color: black;
}

button.list-group-item {
	cursor: pointer;
}

#parent-div {
	display: flex;
}

#plan {
	flex-grow: 1;
}

.left-panel {
	height: 100vh;
	overflow: auto;
}

.tab-pane {
	height: 100%;
}

.left-panel-inner {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.left-panel-inner > div {
	flex: 1;
}

.btn-outline-primary {
	--bs-btn-color: lightgrey;
  	--bs-btn-border-color: #7F55B5;
 	 --bs-btn-hover-bg: #7F55B5;
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-border-color: #7F55B5;
	--bs-btn-active-bg: #7F55B5;
	--bs-btn-active-border-color: #7F55B5;
	--bs-btn-focus-shadow-rgb: 81, 36, 122;
	display: inline-block;
	white-space: nowrap;
}

</style>
