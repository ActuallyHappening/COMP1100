<script lang="ts" setup>
import Course from "./Course.vue";
import { selectedState } from "../apis/state";
import { planAPI } from "../apis/plan";
import { programAPI } from "../apis/db/program";
import { programRequirementAPI } from "../apis/db/program_requirement";
import { cpAPI } from "../apis/cpallocation";

function panelNotVisible() {
	if (!selectedState.value) {
		return true;
	}
	return false;
}

function getProgramReqName(id: string) {
	for (const a in programRequirementAPI.getAll()) {
		if (id === programRequirementAPI.getAll()[a].id.id) {
			return programRequirementAPI.getAll()[a].short_name;
		}
	}
}

function getFullProgram(id: string) {
	for (const a in programRequirementAPI.getAll()) {
		if (id === programRequirementAPI.getAll()[a].id.id) {
			return programRequirementAPI.getAll()[a];
		}
	}
}
</script>
<template>
	<Course
		id="rhs"
		class="rhs"
		v-if="selectedState"
		:code="selectedState"
		type="summary"
	/>
	<template v-if="panelNotVisible()" class="rhs">
		<div class="justify-content-center">
			<h3>{{ programAPI.getCurrent()?.name }}</h3>
			<br />
			<p>Commencing {{ Object.keys(planAPI.getCurrent().planner)[0] }}</p>
		</div>
		<br />
		<template v-if="planAPI.getCurrent().topLevelReqsSelected">
			<h4>Program Requirements</h4>
			<template v-for="req in planAPI.getCurrent().topLevelReqsSelected">
				<h5>
					<i class="fa-solid fa-triangle-exclamation" 
						v-if="cpAPI.getCourseAssignments()[req].achieved_cp < 
							cpAPI.getCourseAssignments()[req].required_cp"
					></i>
					{{ getProgramReqName(req) }}:
					{{ cpAPI.getCourseAssignments()[req].achieved_cp }}/{{
						cpAPI.getCourseAssignments()[req].required_cp
					}}
				</h5>
				<template v-if="getFullProgram(req).sub_requirements">
					<template
						v-for="subreq in getFullProgram(req).sub_requirements"
					>
						<p>
							<i class="fa-solid fa-triangle-exclamation" 
								v-if="cpAPI.getCourseAssignments()[req].achieved_cp < 
									cpAPI.getCourseAssignments()[req].required_cp"
							></i>
							{{ getProgramReqName(subreq.id) }}:
							{{
								cpAPI.getCourseAssignments()[subreq.id]
									.achieved_cp
							}}/{{
								cpAPI.getCourseAssignments()[subreq.id]
									.required_cp
							}}
						</p>
					</template>
				</template>
			</template>
		</template>
	</template>
</template>
<style>
button.rhs:hover {
	background-color: inherit;
}
.fa-triangle-exclamation {
	color:goldenrod;
}
</style>
