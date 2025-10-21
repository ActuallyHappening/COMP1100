<script setup lang="ts">
import { reactive, inject, computed } from "vue";
import type { ProvidedExport } from "./State.vue";
import ProgramReq from "./ProgramReq.vue";
import ProgramReqs from "./ProgramReqs.vue";
import PlannerVisuals from "./PlannerVisuals.vue";
// import { STATE } from "./State.vue";
const {
	localState,
	planState,
	programs,
	getCurrentProgram,
	defaultPlan,
	program_requirements,
} = inject("state") as ProvidedExport;

var currentProgramRequirements = [];
for (const course in getCurrentProgram().program_requirements[1]) {
	currentProgramRequirements.push(
		getCurrentProgram().program_requirements[1][course].id,
	);
};

var courseNamePairing: { [id: string]: string} = {};
for (const item of program_requirements.value) {
	for (const ids of currentProgramRequirements) {
		var course_name = "";
		if (item.id.id === ids) {
			course_name = item.name;
		}
		if (course_name !== "") {
			courseNamePairing[ids] = course_name;
		};
	};
};

function newPlan() {
	const planNums = Object.keys(localState.value.plans).map((planString) =>
		Number(planString.slice(5)),
	);
	const max = Math.max(...planNums);
	const newNum = max + 1;
	const newPlan = `Plan ${newNum}`;
	localState.value.plans[newPlan] = defaultPlan(newNum);
	localState.value.current = newPlan;
}

const top_level_selected = reactive({} as { [key: number]: string });

function majorChange(event: Event) {
	const value = (event.target as HTMLSelectElement).value;
	planState().majorId = value;
};

function courseChange(event: Event) {
	const value = (event.target as HTMLSelectElement).value;
	planState().programId = value;

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
				<select
					class="form-select"
					name="course-code"
					id="major-code"
					:value="planState().majorId"
					@input="majorChange"
				>
					<option value="" hidden>Please select a major</option>
					<option 
						v-for="[id, program_requirement] of Object.entries(courseNamePairing)"
						:value="id">
						{{ program_requirement }}
					</option>
				</select>
			</div>
		</form>
	</div>

	<div class="container-fluid row" id="parent-div">
		<div class="col-4">
			<!-- Tabs -->

			<div class="nav nav-tabs" id="nav-tab" role="tablist">
				<button class="nav-link active" id="core-tab" data-bs-toggle="tab" data-bs-target="#core" type="button" role="tab" aria-controls="core" aria-selected="true">Core Courses</button>
				<button class="nav-link" id="major-tab" data-bs-toggle="tab" data-bs-target="#major" type="button" role="tab" aria-controls="major-tab" aria-selected="false">Major Courses</button>
				<button class="nav-link" id="minor-tab" data-bs-toggle="tab" data-bs-target="#minor" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Minor Courses</button>
			</div>
			<div class="tab-content" id="nav-tabContent">
				<div class="tab-pane fade show active" id="core" role="tabpanel" aria-labelledby="core-tab" tabindex="0">
					core courses
				</div>
				<div class="tab-pane fade" id="major" role="tabpanel" aria-labelledby="major-tab" tabindex="0">
					major courses
				</div>
				<div class="tab-pane fade" id="minor" role="tabpanel" aria-labelledby="minor-tab" tabindex="0">
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
					:requirement-id="top_level_selected[index]"
					v-if="top_level_selected[index]"
				/>
			</div>
		</div>
		<div class="col-7" id="plan">
			<PlannerVisuals />
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
        black 20px, /* Start solid black after 20px from left */
        black calc(100% - 20px), /* End solid black 20px from right */
        transparent /* Fade to transparent at the right edge */
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
