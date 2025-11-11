<script setup lang="ts">
import _ from "lodash";
import { computed, ref } from "vue";
import ProgramReq from "./ProgramReq.vue";
import ProgramReqs from "./ProgramReqs.vue";
import PlannerVisuals from "./PlannerVisuals.vue";
import RightPanel from "./RightPanel.vue";
import FilterHeader from "./FilterHeader.vue";
import { RecordId } from "surrealdb";
import { localState } from "../apis/state";
import { defaultPlan, planAPI } from "../apis/plan";
import {
	programRequirementAPI,
	requirement_type_to_header,
	requirement_types_to_header,
} from "../apis/db/program_requirement";
import { programAPI, programs } from "../apis/db/program";
import { filters, filterAPI } from "../apis/filter";

function newPlan() {
	checker();
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
	checker();
	const value = (event.target as HTMLSelectElement).value;
	const plan_state = planAPI.getCurrent();
	if (plan_state) {
		plan_state.programId = value;
		//plan_state.topLevelReqsSelected[0] = "b"+value.split(":").slice(1)+"-core";
	}
}

/** e.g. "Core" or "Major" */
type HumanHeaderIndexName = string;
const getHeaderByIndex = (index: number): HumanHeaderIndexName | undefined => {
	checker();
	const me_req = planAPI.getCurrent().topLevelReqsSelected[index];
	// if a specific req is already selected
	if (typeof me_req === "string") {
		return requirement_type_to_header(
			programRequirementAPI.getOrError(
				new RecordId("program_requirement", me_req),
			).type,
		);
	}
	// otherwise, a summary e.g. "Major | No Major | Extended Major"
	const currentProgram = programAPI.getCurrent();
	if (!currentProgram) {
		return undefined;
	}
	const a = currentProgram.program_requirements[index]
		.map((req_id) => programRequirementAPI.get(req_id))
		.filter((req) => !!req)
		.map((req) => req.type);
	return requirement_types_to_header(a);
};
/** e.g. "core" or "major-extended-major-no-major" */
type HTMLHeaderIndexKey = string;
const normalize = (
	str: HumanHeaderIndexName | undefined,
): HTMLHeaderIndexKey => {
	checker();
	return (
		(str ?? "UNDEFINED")
			.toLowerCase()
			// pasted from claude https://claude.ai/chat/a6a9877e-b767-4173-bc62-da13870b7524
			.replace(/[^a-zA-Z0-9\s]/g, "")
			.replace(/\s+/g, "-")
	);
};
const normalizedIndexHeaders = computed((): string[] => {
	checker();
	const ret: string[] = [];
	const currentProgram = programAPI.getCurrent();
	if (!currentProgram) {
		return [];
	}
	let dict = {};
	for (const idx in currentProgram.program_requirements) {
		if (dict[programRequirementAPI.get(currentProgram.program_requirements[idx][0])?.name.split(" ")[0]]) {
			let currentValue = dict[programRequirementAPI.get(currentProgram.program_requirements[idx][0])?.name.split(" ")[0]];
			currentValue.push([idx, programRequirementAPI.get(currentProgram.program_requirements[idx][0])]);
			dict[programRequirementAPI.get(currentProgram.program_requirements[idx][0])?.name.split(" ")[0]] = currentValue;
		} else {
			dict[programRequirementAPI.get(currentProgram.program_requirements[idx][0])?.name.split(" ")[0]] = [[idx, programRequirementAPI.get(currentProgram.program_requirements[idx][0])]];
		}
		console.log(dict)
		const i = Number(idx);
		ret[i] = normalize(getHeaderByIndex(i));
	}
	console.log(dict)
	return [ret, dict];
});

// Vue tab impl
const selectedIndex = ref(0);
// const tabRefs = useTemplateRef("tabs");
// watch(
// 	tabRefs,
// 	(refs) => {
// 		refs?.forEach((el) => {
// 			el.bsTabTrigger = new bootstrap.Tab(el);
// 			// console.info(el, el.bsTabTrigger);
// 		});
// 	},
// 	{ immediate: true },
// );
const tabClicked = (event: Event, i: number) => {
	checker();
	event.preventDefault();
	selectedIndex.value = i;
	// event.target?.bsTabTrigger?.show();
};

const navScroll = (event: Event) => {
	checker();
	event.preventDefault();
	if (event.currentTarget) {
		event.currentTarget.scrollLeft += event.deltaY + event.deltaX;
	}
};

function checker() {
	let notPossible = document.getElementsByClassName("Toastify");
	for (let i = 0; i < notPossible.length; i++) {
		let button = notPossible[i]?.querySelector("button");
		if (button) {
			button.remove();
		}
	}
}

function including(ob: any[], ind: number) {
	for (const o in ob) {
		if (Number(ob[o][0]) === ind) {
			return true;
		}
	}
	return false;
}

function getName(ob: any[], ind: number) {
	for (const o in ob) {
		if (Number(ob[o][0]) === ind) {
			return (ob[o][1].short_name);
		}
	}
	return;
}
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
						v-model="planAPI.getCurrent().name"
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
	<!-- Top bar selections -->
	<div class="w-100 container-fluid purple-bg ps-3 pe-3 pb-3">
		<form action="#" @submit.prevent="() => {}">
			<div class="row">
				<div class="col-md-2 col">
					<div class="col">
						<div class="row">
							<label
								class="col-form-label-lg col-form-label col-auto"
								>Year</label
							>
							<div class="col">
								<input
									type="number"
									placeholder="2025"
									disabled
									class="form-control-lg form-control"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-5 col">
					<div class="col">
						<div class="row">
							<label
								class="col-form-label-lg col-form-label col-auto"
								>Course</label
							>
							<div class="col">
								<select
									name="course-code"
									id="course-code"
									class="form-select-lg form-select"
									:value="planAPI.getCurrent().programId"
									@input="courseChange"
								>
									<option value="" hidden>
										Please select a course
									</option>
									<option
										v-for="program in programs"
										:key="program.id.id.toString()"
										:value="program.id.id.toString()"
									>
										{{ program.name }}
									</option>
								</select>
							</div>
						</div>
					</div>
				</div>
				<div class="col-md-5 col">
					<div class="col">
						<div class="row">
							<label
								class="col-form-label-lg col-form-label col-auto"
								>Major</label
							>
							<div class="col">
								<!-- Hardcoding the first index as the major
							Trakcking issue: https://github.com/COMP1100-7110-2025-s2/Mon_9am_Team_10/issues/17
							-->
								<ProgramReq
									v-if="
										programAPI.getCurrent()
											?.program_requirements?.[1]
									"
									:index="1"
								/>
								<select
									v-else
									class="form-select form-select-lg"
									disabled
								></select>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>

	<!-- Row -->
	<div
		class="container-fluid row p-0 me-0 ms-0 mt-2"
		id="parent-div"
		v-if="programAPI.getCurrent()"
	>
		<div class="col-3 panel">
			<div class="nav nav-tabs" id="nav-tab" role="tablist" @wheel="navScroll" v-if="programAPI.getCurrent()">
				<div
					v-for="(c, index) in normalizedIndexHeaders[1]"
					:key="index"
				>
    				<p class="fw-bold text-center mb-3">{{ index }}</p>
					<div class="d-flex overflow-auto flex-nowrap">
						<div v-for="(id, i) in normalizedIndexHeaders[0]" :key="id" class="mb-2">
							<div v-if="including(c, i)">
								<button
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
									{{ getName(c, i) }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="tab-content" id="nav-tabContent">
				<template v-for="(id, i) in normalizedIndexHeaders[0]" :key="id">
					<div
						v-show="i === selectedIndex"
						class="tab-pane fade show"
						:class="{ active: i == selectedIndex }"
						:id="`homescreen-leftbar-${id}-tabcontent`"
						role="tabpanel"
						:aria-labelledby="`homescreen-leftbar-${id}-tab`"
						tabindex="0"
					>
						<!-- {{ getHeaderByIndex(i) }} -->
						<ProgramReq :index="i" />
						<!-- Filters/Search -->
						<form
							role="search"
							v-if="planAPI.getCurrent().topLevelReqsSelected[i]"
							class="input-group"
						>
							<p class="w-100 d-flex mb-0">
								<input
									type="search"
									class="form-control"
									placeholder="Search for a course"
									aria-label="search"
									autocomplete="off"
									v-model="filters.search"
								/>
								<input
									type="search"
									class="form-control d-none"
									placeholder="null"
									aria-label="search"
								/>
								<button
									class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
									type="button"
									data-bs-toggle="collapse"
									data-bs-target="#semFilter"
									aria-expanded="false"
									aria-controls="semFilter"
								>
									<span class="visually-hidden">
										Toggle Dropdown
									</span>
								</button>
							</p>
							<div class="collapse w-100" id="semFilter">
								<div
									class="card card-body d-flex flex-row justify-content-between"
								>
									<div>
										<h4>Semesters Offered</h4>
										<div class="form-check">
											<input
												type="checkbox"
												class="form-check-input"
												id="sem1check"
												v-model="filters.sem_1"
											/>
											<label
												class="form-check-label"
												for="sem1check"
												>Semester 1</label
											>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												class="form-check-input"
												id="sem2check"
												v-model="filters.sem_2"
											/>
											<label
												class="form-check-label"
												for="sem2check"
												>Semester 2</label
											>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												class="form-check-input"
												id="sem3check"
												v-model="filters.sem_summer"
											/>
											<label
												class="form-check-label"
												for="sem3check"
												>Summer Semester</label
											>
										</div>
									</div>
									<div>
										<button
											type="button"
											class="btn btn-outline-secondary h-100"
											@click="filterAPI.clear"
										>
											Clear Filters
										</button>
									</div>
								</div>
							</div>
						</form>
						<ProgramReqs
							v-if="planAPI.getCurrent().topLevelReqsSelected[i]"
							:requirement-id="
								planAPI.getCurrent().topLevelReqsSelected[i]!
							"
						/>
					</div>
				</template>
			</div>
		</div>
		<div class="col-7 panel" id="plan">
			<PlannerVisuals />
		</div>
		<div class="col-2 panel">
			<RightPanel />
		</div>
	</div>
	<!-- Onboarding -->
	<div
		class="container-fluid d-flex align-items-center justify-content-center"
		style="min-height: 50vh; font-size: 150%"
		v-else
	>
		<div>
			<form action="#" @submit.prevent="() => {}">
				<!-- <div class="input-group"> -->
				<label class="form-label">Year</label>
				<input
					type="number"
					class="form-control form-control-lg"
					placeholder="2025"
					disabled
				/>
				<label for="course-code" class="form-label">Course</label>
				<select
					class="form-select form-select-lg"
					name="course-code"
					id="course-code"
					:value="planAPI.getCurrent().programId"
					@input="courseChange"
				>
					<option value="" hidden>Please select a course</option>
					<option
						v-for="program in programs"
						:key="program.id.id.toString()"
						:value="program.id.id.toString()"
					>
						{{ program.name }}
					</option>
				</select>
			</form>
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
	flex-wrap: nowrap;
	scroll-behavior: smooth;
	-webkit-overflow-scrolling: touch;
	mask-image: linear-gradient(
		to right,
		transparent,
		black 20px,
		/* Start solid black after 20px from left */ black calc(100% - 20px),
		/* End solid black 20px from right */ transparent
			/* Fade to transparent at the right edge */
	);
}

/* Scroll horizontally, but hide scrollbar */
/* https://www.w3schools.com/howto/howto_css_hide_scrollbars.asp */
#nav-tab {
	overflow-y: hidden;
	overflow-x: scroll;
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
}
#nav-tab::-webkit-scrollbar {
	display: none;
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

/* #parent-div {
	display: flex;
} */

#plan {
	flex-grow: 1;
}

.panel {
	height: calc(100vh - 9.5rem);
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
	--bs-btn-border-color: #7f55b5;
	--bs-btn-hover-bg: #7f55b5;
	--bs-btn-hover-color: #fff;
	--bs-btn-hover-border-color: #7f55b5;
	--bs-btn-active-bg: #7f55b5;
	--bs-btn-active-border-color: #7f55b5;
	--bs-btn-focus-shadow-rgb: 81, 36, 122;
	display: inline-block;
	white-space: nowrap;
}
</style>
