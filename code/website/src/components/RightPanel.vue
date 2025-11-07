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

function progress(){
	return ((cpAPI.getCourseAssignments()[1] / programAPI.getCurrent().required_cp)*100).toFixed(0);
}
</script>
<template>
	<Course
		id="rhs"
		class="rhs"
		style="border-radius: 20px; overflow: hidden;"
		v-if="selectedState"
		:code="selectedState"
		type="summary"
	/>
	<div v-if="panelNotVisible()" class="rhs">
		<div class="justify-content-center text-center">
			<h3>{{ programAPI.getCurrent()?.name }}</h3>
			<p>Commencing {{ Object.keys(planAPI.getCurrent().planner)[0] }}</p>
		</div>
		<br />
		<template v-if="planAPI.getCurrent().topLevelReqsSelected">
			<h4>Program Requirements</h4>
			<ul>
			<template v-if="!planAPI.getCurrent().topLevelReqsSelected[1]">
				<li><h5><strong><i class="fa-solid fa-triangle-exclamation"></i> No major selected</strong></h5></li>
			</template>
			<template v-for="req in planAPI.getCurrent().topLevelReqsSelected">
				<li>
					<h5>
						<i class="fa-solid fa-triangle-exclamation" 
							v-if="cpAPI.getCourseAssignments()[0][req].achieved_cp < 
								cpAPI.getCourseAssignments()[0][req].required_cp"
						></i>
						{{ getProgramReqName(req) }}:
						<strong>{{ cpAPI.getCourseAssignments()[0][req].achieved_cp }}/{{
							cpAPI.getCourseAssignments()[0][req].required_cp
						}}</strong> (Max {{ cpAPI.getCourseAssignments()[0][req].max_cp }})
					</h5>
				<template v-if="getFullProgram(req).sub_requirements">
					<ul>
					<template
						v-for="subreq in getFullProgram(req).sub_requirements"
					>	
						<li>
							<h6>
								<i class="fa-solid fa-triangle-exclamation" 
									v-if="cpAPI.getCourseAssignments()[0][subreq.id].achieved_cp < 
										cpAPI.getCourseAssignments()[0][subreq.id].required_cp"
								></i>
								{{ getProgramReqName(subreq.id) }}:
								<strong>{{
									cpAPI.getCourseAssignments()[0][subreq.id]
										.achieved_cp
								}}/{{
									cpAPI.getCourseAssignments()[0][subreq.id]
										.required_cp
								}}</strong> (Max {{ cpAPI.getCourseAssignments()[0][subreq.id].max_cp }})
							</h6>
						</li>
					</template>
					</ul>
				</template>
				</li>
			</template>
			</ul>
		</template>
		<br>
		<template v-if="cpAPI.getCourseAssignments()[1] || cpAPI.getCourseAssignments()[1] === 0">
			<h5 class="text-center">Total points: {{ cpAPI.getCourseAssignments()[1] }}/{{ programAPI.getCurrent().required_cp }}</h5>
			<div class="progress" role="progressbar" aria-label="Example with label" aria-valuenow="{{ progress() }}" aria-valuemin="0" aria-valuemax="100">
				<div class="progress-bar" v-bind:style="{ width: progress() + '%', backgroundColor: '#7f55b5'}">{{ progress() }}%</div>
			</div>
		</template>
	</div>
</template>

<style>

.fa-triangle-exclamation {
	color:goldenrod;
}

.rhs {
	background-color: #51247a;
	color: white;
	border-radius: 20px;
	padding: 15px;
	overflow: hidden;
}

.rhs a {
	color: #4dd0e1;
}

.rhs a:hover {
	color: #80dee8;
}

</style>
