<script setup lang="ts">
import { reactive, inject, computed } from "vue";
import type { ProvidedExport } from "./State.vue";
import ProgramReq from "./ProgramReq.vue";
import ProgramReqs from "./ProgramReqs.vue";
import PlannerVisuals from "./PlannerVisuals.vue";
import { RecordId } from "surrealdb";
import _ from "lodash";
// import { STATE } from "./State.vue";
const {
	localState,
	planState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
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

/** Keys are indicies into `getCurrentProgram().program_requirements` */
const top_level_selected = reactive({} as { [key: number]: RecordId<string> });

const header_by_index = (index: number): string | undefined => {
	// if this index is already chosen, set the header to the type
	// of the selected program requirment, e.g. "No Major"
	if (top_level_selected[index]) {
		const selectedProgramReq = getProgramRequirement(
			top_level_selected[index],
		)?.type;
		if (!selectedProgramReq) {
			console.error(`Unusual error`, selectedProgramReq, `index`, index);
		} else {
			// header should be selected program req
			return requirement_type_to_header(selectedProgramReq);
		}
	}

	// otherwise, a summary e.g. "Major | No Major | Extended Major"
	const a = getCurrentProgram()
		?.program_requirements[index]?.map((req_id) =>
			getProgramRequirement(req_id),
		)
		.filter((req) => !!req)
		.map((req) => req.type);
	if (!a) return a;
	return requirement_types_to_header(a);
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
						v-model="planState().name"
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
				<button class="btn btn-primary w-100" @click="newPlan">
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
					:value="planState().programId"
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
					v-if="
						getCurrentProgram()?.program_requirements?.length >= 2
					"
					:index="1"
					@selected="(req) => (top_level_selected[1] = req)"
				/>
			</div>
		</form>
	</div>

	<div class="container-fluid row" id="parent-div">
		<div class="col-3">
			<!-- Tabs -->

			<div class="nav nav-tabs" id="nav-tab" role="tablist">
				<button
					class="nav-link active"
					id="core-tab"
					data-bs-toggle="tab"
					data-bs-target="#core"
					type="button"
					role="tab"
					aria-controls="core"
					aria-selected="true"
				>
					{{ header_by_index(0) }}
					<!-- Core Courses -->
				</button>
				<button
					class="nav-link"
					id="major-tab"
					data-bs-toggle="tab"
					data-bs-target="#major"
					type="button"
					role="tab"
					aria-controls="major-tab"
					aria-selected="false"
				>
					{{ header_by_index(1) }}
					Major Courses
				</button>
				<button
					class="nav-link"
					id="minor-tab"
					data-bs-toggle="tab"
					data-bs-target="#minor"
					type="button"
					role="tab"
					aria-controls="nav-contact"
					aria-selected="false"
				>
					Minor Courses
				</button>
			</div>
			<div class="tab-content" id="nav-tabContent">
				<div
					class="tab-pane fade show active"
					id="core"
					role="tabpanel"
					aria-labelledby="core-tab"
					tabindex="0"
				>
					core courses
				</div>
				<div
					class="tab-pane fade"
					id="major"
					role="tabpanel"
					aria-labelledby="major-tab"
					tabindex="0"
				>
					major courses
				</div>
				<div
					class="tab-pane fade"
					id="minor"
					role="tabpanel"
					aria-labelledby="minor-tab"
					tabindex="0"
				>
					minor courses
				</div>
			</div>

			<!-- Top level program_requirement picker, e.g. between type: maj, and type: nomaj -->
			<div
				v-for="(reqlist, index) in getCurrentProgram()
					?.program_requirements"
				:key="!reqlist[0] ? undefined : reqlist[0].id.toString()"
			>
				<ProgramReq
					:index="index"
					@selected="(req) => (top_level_selected[index] = req)"
				/>
				<ProgramReqs
					v-if="top_level_selected[index]"
					:requirement-id="top_level_selected[index]"
				/>
			</div>
		</div>
		<div class="col-7" id="plan">
			<PlannerVisuals />
		</div>
		<div class="col-2">
			<!-- Put this in a new vue file probably -->
			<a
				class="mb-2"
				href="https://programs-courses.uq.edu.au/course.html?course_code=SCIE1000&offer=53544c554332494e"
			>
				<!-- this links to sem 2, 2025. The 5th last character (2) denotes semester #, for different years append &year=2026 etc -->
				<h3 class="text-center">SCIE1000</h3>
				<p class="text-center">Theory & Practice in Science</p>
			</a>
			<ul>
				<li>
					<h5>
						<strong>Semesters offered: <span>&#9432;</span></strong>
					</h5>
					<!-- On hover show disclaimer -->
					<p>
						SCIE1000 is available in the following semesters:
						Semester 1, Semester 2
					</p>
				</li>
				<li>
					<h5><strong>Prerequisites:</strong></h5>
					<p>SCIE1000 has no prerequisite courses.</p>
					<p>
						You have completed all necessary prerequisites to begin
						this course.
					</p>
				</li>
				<li>
					<h5><strong>Incompatibilities:</strong></h5>
					<!-- shows up optionally? -->
					<p>SCIE1000 is incompatible with SCIE1100.</p>
					<!-- <p>Please </p> -->
				</li>
				<li>
					<h5><strong>Credits:</strong></h5>
					<p>This course counts _ towards _.</p>
				</li>
			</ul>
		</div>
	</div>
</template>

<style scoped>
.purple-bg {
	background-color: #51247a;
	color: white;
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
</style>
