<script lang="ts" setup>
import { inject } from "vue";
import _ from "lodash";
import type { ProvidedExport } from "./State.vue";
import Course from "./Course.vue";

const { selectedState } = inject("state") as ProvidedExport;

const course = selectedState;
</script>
<template>
	<Course class="rhs" v-if="course" :code="course" type="summary" />
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
				SCIE1000 is available in the following semesters: Semester 1,
				Semester 2
			</p>
		</li>
		<li>
			<h5><strong>Prerequisites:</strong></h5>
			<p>SCIE1000 has no prerequisite courses.</p>
			<p>
				You have completed all necessary prerequisites to begin this
				course.
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
</template>
<style>

button.rhs:hover {
	background-color: inherit;
}

</style>