<script lang="ts" setup>
import { computed, ref, toRaw } from "vue";
import ErrorView from "../../Error.vue";
import _ from "lodash";
import {
	courseAPI,
	type Course,
	error_course,
	type Prereq,
} from "../../apis/db/course";
import { selectedState } from "../../apis/state";
import { planAPI } from "../../apis/plan";
import { plannerAPI, type SemId } from "../../apis/planner";
import { programRequirementAPI } from "../../apis/db/program_requirement";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
});

type Err = any;
const error = ref(undefined as undefined | Err);
const handleError = (err: Err) => {
	console.error(err);
	error.value = err;
};

const course = computed((): Course => {
	const ret = courseAPI.get(courseAPI.code(props.code));
	if (!ret) {
		handleError(new Error(`Couldn't find course ${props.code}`));
		return error_course(`Couldn't find course ${props.code}`);
	}
	return ret;
});

/**
 * true = prereqs passed
 * false = prereqs failed
 * undefined = not in planner
 */
const prereqChecked = computed(() => {
	const planner = plannerAPI(planAPI.getCurrent().planner);
	const previous = previousCourses.value;
	if (!previous) {
		return undefined;
	}
	const prereqCheck = planner.prereqCheck({
		previousCourses: previous,
		thisCourse: course.value,
	});
	return prereqCheck;
});
const sems = computed(() => {
	if (!course.value) {
		return "";
	}
	const summer = course.value.sem_summer ? " + Summer" : "";
	if (course.value.sem_1 && course.value.sem_2) {
		return "Sem 1 & 2" + summer;
	} else if (course.value.sem_1) {
		return "Sem 1" + summer;
	} else if (course.value.sem_2) {
		return "Sem 2" + summer;
	} else {
		handleError("Unknown semesters");
		return "Unknown" + summer;
	}
});
const selectCourse = (obCourse: Course) => {
	let dCourse = course.value;
	for (const a in planAPI.getCurrent().planner) {
		if (
			planAPI.getCurrent().planner[a].includes(dCourse.id.id.toString())
		) {
			selectedState.value = dCourse.id.id.toString();
		}
	}
	let semss = Object.keys(planAPI.getCurrent().planner);
	for (const c in semss) {
		const divName = semss[c]?.toString();
		const divItem = document.getElementById(divName);
		if (divItem) {
			divItem.classList.remove("prereq-success");
			divItem.classList.remove("prereq-fail");
			divItem.classList.remove("prereq-unavailable");
			const headerRow = divItem.parentElement;
			const tds = Array.from(headerRow?.querySelectorAll("td"));
			for (const td in tds) {
				const buttons = Array.from(tds[td]?.querySelectorAll("button"));
				for (const button in buttons) {
					buttons[button]?.classList.remove("disabled");
				}
			}
		}
	}
};
const previousCourses = computed((): Course[] | undefined => {
	const planner = plannerAPI(planAPI.getCurrent().planner);
	const sem_index = planner.getIndexOfCourse(course.value.id);
	if (!sem_index) {
		return undefined;
	}
	const [sem_id, _index] = sem_index;
	const previous = planner.previousCoursesTo(sem_id, course.value.id);
	return previous;
});
const incompatibleCheck = computed(() => {
	if (!previousCourses.value) {
		return true;
	}
	const previous = new Set(
		previousCourses.value.map((course) => course.id.id.toString()),
	);
	const incompatible = new Set(
		course.value.incompatible.map((course) => course.id.id.toString()),
	);
	if (previous.intersection(incompatible).size > 0) {
		return false;
	}
	return true;
});

const close = () => {
	// remove this from selected and from visual planner
	const planner = plannerAPI(planAPI.getCurrent().planner);
	planner.removeCourse(course.value.id);
	// Deleting a course selects it, CY Interview 1 mentions this isn't desired behaviour
	selectedState.value = undefined;
	for (const c in sems) {
		const divName = sems[c]?.toString();
		const divItem = document.getElementById(divName);
		if (divItem) {
			divItem.classList.remove("prereq-success");
			divItem.classList.remove("prereq-fail");
			divItem.classList.remove("prereq-unavailable");
			const headerRow = divItem.parentElement;
			const tds = Array.from(headerRow?.querySelectorAll("td"));
			for (const td in tds) {
				const buttons = Array.from(tds[td]?.querySelectorAll("button"));
				for (const button in buttons) {
					buttons[button]?.classList.remove("disabled");
				}
			}
		}
	}
};


function coreCourseChecker(course: Course) {
	let reqs = planAPI.getCurrent().topLevelReqsSelected;
	let filteredReqs = [];
	for (const req in reqs) {
		if (reqs[req]?.includes('core') && !(reqs[req]?.includes('flexcore'))) {
			filteredReqs.push(reqs[req]);
		}
	}
	let realReqs = []
	for (const req in filteredReqs) {
		let requirement = programRequirementAPI.getAll()
		for (const r in requirement) {
			if (requirement[r].id.id === filteredReqs[req]) {
				realReqs.push(requirement[r])
			}
		}
	}
	for (const req in realReqs) {
		for (const a in realReqs[req].course_options) {
			if (realReqs[req].course_options[a][0].id === course.id.id) {
				return true;
			}
		}
	}
	return false;
}
</script>

<template>
	<button
		type="button"
		class="list-group-item w-100"
		:id="'vue-Course-' + course?.code"
		@click="selectCourse(course)"
	>
		<template v-if="!error">
			<div class="justify-content-end d-flex">
				<div title="Core Course" v-if="coreCourseChecker(course)">
					<i class="fa-solid fa-meteor"></i>
					<!-- Core course example -->
					<!-- Up to you to implement, idk what you want -->
				</div>
				<div class="m-auto">
					<h4 class="pb-0 mb-0">{{ course?.code }}</h4>
				</div>
				<div>
					<button
						type="button"
						class="btn-close"
						aria-label="Close"
						@click.prevent="close"
					></button>
				</div>
			</div>
			<i
				><p class="p-0 m-0">{{ course?.name }}</p></i
			>
			<!-- TODO: Caleb rig this properly
				https://github.com/COMP1100-7110-2025-s2/Mon_9am_Team_10/issues/31
			 -->
			<p class="m-0 p-0" v-if="coreCourseChecker(course)">Core course</p>
			<p class="m-0 p-0">
				Prereqs passed:
				<span v-if="prereqChecked"
					><i
						class="fa-solid fa-circle-check fa-lg"
						style="color: #0ce100"
					></i
				></span>
				<span v-else
					><i
						class="fa-solid fa-triangle-exclamation text-warning fa-lg"
					></i
				></span>
			</p>
		</template>
		<ErrorView v-else :err="error" />
	</button>
</template>

<style scoped>
button.course-selection-active {
	background-color: #51247a;
	color: #ffffff;
}

button.course-selection:hover {
	background-color: #7f55b5;
	color: #f8f8f8;
}

button.course-selection-active:hover {
	background-color: #51247a;
	color: #ffffff;
}

button.course-selection {
	transition: background-color 0.3s ease-in-out;
	border-radius: 10px;
}

table button:hover {
	background-color: inherit;
}
.btn-close:hover :not(.btn-deselect) {
	filter: invert(100%) sepia(100%) hue-rotate(300deg) saturate(100000%);
	opacity: 1;
}
.btn-deselect:hover {
	filter: invert(100%) sepia(100%) hue-rotate(300deg) saturate(100000%);
	opacity: 1;
}
.gray-text {
	color: gray;
}

span.gray-text:hover {
	color: white;
}

span {
	transition: color 0.3s ease-in-out;
}
</style>
