<script lang="ts" setup>
import { defineProps, computed, ref, toRaw } from "vue";
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
import { RecordId } from "surrealdb";
import { filters } from "../../apis/filter";
import { cpAPI } from "../../apis/cpallocation";
import { programRequirementAPI } from "../../apis/db/program_requirement";
import { advCoursesAPI } from "../../apis/db/adv_courses";
import { prereqAPI } from "../../apis/prereq";

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

const incompatible_list = computed(() => {
	if (course.value?.incompatible) {
		return course.value.incompatible
			.map((id) => id.id.toString().toUpperCase())
			.join(", ");
	} else {
		return "";
	}
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

const prereqs_list = computed(() => {
	if (course.value?.prerequisites) {
		return prereqAPI(course.value?.prerequisites).render();
	} else {
		return "";
	}
});

const semesterOfCourseInPlannerWhichThePersonIsTaking = computed(
	(): SemId | undefined => {
		const rawPlan = planAPI.getCurrent().planner;
		const planner = plannerAPI(rawPlan);
		const inPlanner = planner.getIndexOfCourse(course.value.id);
		if (inPlanner) {
			return inPlanner[0];
		} else if (
			planner.getIndexOfCourse(getAdvancedCourse(course.value).id)
		) {
			return planner.getIndexOfCourse(
				getAdvancedCourse(course.value).id,
			)[0];
		} else {
			return undefined;
		}
	},
);

function getAdvancedCourse(course: Course) {
	const advancedCourses = advCoursesAPI.getCurrent();
	let advCourse = "";
	for (const c in advancedCourses) {
		for (const a in advancedCourses[c]) {
			if (a === "course") {
				if (advancedCourses[c][a].id === course.id.id) {
					advCourse = advancedCourses[c]["adv_course"];
					advCourse = courseAPI.get(advCourse);
				}
			}
		}
	}
	return advCourse;
}

const isInPlanner = computed((): boolean => {
	const rawPlan = planAPI.getCurrent().planner;
	const planner = plannerAPI(rawPlan);
	let inPlanner = planner.getIndexOfCourse(course.value.id);
	if (!inPlanner) {
		for (const a in advCoursesAPI.getCurrent()) {
			if (
				advCoursesAPI.getCurrent()[a]["course"].id ===
				course.value.id.id
			) {
				inPlanner = planner.getIndexOfCourse(
					getAdvancedCourse(course.value).id,
				);
			}
		}
	}
	if (!inPlanner) {
		return false;
	} else {
		return true;
	}
});

function checkAdvanced(course: Course) {
	for (const a in advCoursesAPI.getCurrent()) {
		if (advCoursesAPI.getCurrent()[a].course.id === course.id.id) {
			if (
				selectedState.value ===
				advCoursesAPI.getCurrent()[a].adv_course.id
			) {
				return true;
			}
		}
	}
	return false;
}

const advancedCourse = computed((): boolean => {
	const advancedCourses = advCoursesAPI.getCurrent();
	for (const c in advancedCourses) {
		for (const a in advancedCourses[c]) {
			if (advancedCourses[c][a].id === course.value.id.id) {
				return true;
			}
		}
	}
	return false;
});

function toggle_adv(basicCourse: Course, course: Course) {
	const basicSpan = document.getElementById("vue-Span-" + basicCourse.code);
	let topCourse = "";
	if (basicCourse === course) {
		topCourse = getAdvancedCourse(course).code;
	} else {
		topCourse = course.code;
	}
	const advSpan = document.getElementById("vue-Span-" + topCourse);
	basicSpan?.classList.remove("gray-text");
	advSpan?.classList.remove("gray-text");
	if (basicCourse.code === course.code) {
		advSpan?.classList.add("gray-text");
	} else {
		basicSpan?.classList.add("gray-text");
	}

	const title = document.getElementById("vue-Title-" + basicCourse.code);
	const prereq = document.getElementById("vue-Prereq-" + basicCourse.code);
	const incomp = document.getElementById("vue-Incomp-" + basicCourse.code);
	if (title) {
		const summer = course.sem_summer ? " + Summer" : "";
		let semss = "";
		if (course.sem_1 && course.sem_2) {
			semss = "Sem 1 & 2" + summer;
		} else if (course.sem_1) {
			semss = "Sem 1" + summer;
		} else if (course.sem_2) {
			semss = "Sem 2" + summer;
		} else {
			handleError("Unknown semesters");
			semss = "Unknown" + summer;
		}
		title.innerHTML = `${course.name} <i>(${semss})</i>`;
	}
	if (prereq) {
		let prereqs = "";
		if (course.prerequisites) {
			prereqs = prereqAPI(course.prerequisites).render();
		}
		prereq.innerHTML = `Prerequisites: <i>${prereqs}</i>`;
	}
	if (incomp) {
		let incompetent = "";
		if (course.incompatible) {
			incompetent = course.incompatible
				.map((id) => id.id.toString().toUpperCase())
				.join(", ");
		}
		incomp.innerHTML = `Incompatible: <i>${incompetent}</i>`;
	}
}

const selectCourse = (obCourse: Course) => {
	let dCourse = course.value;

	if (selectedState.value == dCourse.id.toString()) {
		// already selected
		selectedState.value = undefined;
	} else {
		const masterHeader = document.getElementById(
			"vue-Upper-" + obCourse.code,
		);
		if (masterHeader) {
			if (
				masterHeader
					.querySelector(".gray-text")
					?.innerHTML.includes(obCourse.code)
			) {
				dCourse = getAdvancedCourse(obCourse);
			}
		}
		const masterHeaderTwo = document.getElementById(
			"vue-Unav-" + dCourse.code,
		);
		if (masterHeaderTwo) {
			if (!masterHeaderTwo.innerHTML.includes(dCourse.code)) {
				dCourse = getAdvancedCourse(dCourse);
			}
		}
		console.info(`Selecting course: `, dCourse.id);
		selectedState.value = dCourse.id.id.toString();

		//Code to highlight th's for prerequisites. May need to be moved
		//Code to find eligible semesters
		let semss = Object.keys(planAPI.getCurrent().planner);
		let oppSems = semss;

		//Remove existing styling if applicable
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
					const buttons = Array.from(
						tds[td]?.querySelectorAll("button"),
					);
					for (const button in buttons) {
						buttons[button]?.classList.remove("disabled");
					}
				}
			}
		}
		const nowTable = document.getElementById("mainTable");
		const classNameToRemove = "incompatible-true";
		if (nowTable) {
			const elements = nowTable.querySelectorAll<HTMLElement>(
				`.${classNameToRemove}`,
			);
			elements.forEach((el) => el.classList.remove(classNameToRemove));
		}
		let in_planner = false;
		for (const c in planAPI.getCurrent().planner) {
			if (
				planAPI
					.getCurrent()
					.planner[c].includes(dCourse.id.id.toString().toLowerCase())
			) {
				in_planner = true;
			}
		}
		if (!in_planner) {
			//Filter out to only required semsters
			semss = semss.filter((semester) => {
				if (semester.includes("Sem 1")) {
					if (dCourse.sem_1) {
						return true;
					} else {
						return false;
					}
				} else if (semester.includes("Sem 2")) {
					if (dCourse.sem_2) {
						return true;
					} else {
						return false;
					}
				} else {
					if (dCourse.sem_summer) {
						return true;
					} else {
						return false;
					}
				}
			});

			oppSems = oppSems.filter((semester) => {
				if (semss.includes(semester)) {
					return false;
				}
				return true;
			});

			// Getting all the previous courses for each of the sems available
			let semsBeforeLists: { [key: SemId]: Course[] } = {};
			for (const c in semss) {
				semsBeforeLists[semss[c]] = plannerAPI(
					planAPI.getCurrent().planner,
				).prereqCheck({
					previousCourses: plannerAPI(
						planAPI.getCurrent().planner,
					).previousCoursesTo(semss[c], dCourse),
					thisCourse: dCourse,
				});
			}

			// Updating classes of table th's to show available sems
			for (const c in semss) {
				const semDiv = document.getElementById(semss[c]?.toString());
				if (semDiv) {
					if (semsBeforeLists[semss[c]]) {
						semDiv.classList.add("prereq-success");
					} else {
						semDiv.classList.add("prereq-fail");
					}
				}
			}

			// Making the rest of the divs unavailable
			for (const c in oppSems) {
				const semDiv = document.getElementById(oppSems[c]?.toString());
				if (semDiv) {
					semDiv.classList.add("prereq-unavailable");
					const headerRow = semDiv.parentElement;
					const tds = Array.from(headerRow?.querySelectorAll("td"));
					for (const td in tds) {
						const buttons = Array.from(
							tds[td]?.querySelectorAll("button"),
						);
						for (const button in buttons) {
							buttons[button]?.classList.add("disabled");
						}
					}
				}
			}

			// Demonstrating that a course is incompatible

			// Getting all courses in the plan so far
			let allCourses: string[] = [];
			const plan = planAPI.getCurrent().planner;
			for (const c in plan) {
				for (const b in plan[c]) {
					if (plan[c][b]) {
						allCourses.push(plan[c][b]).toString();
					}
				}
			}

			//Filtering out to only get incompatible courses
			allCourses = allCourses.filter((c) => {
				for (const i in dCourse.incompatible) {
					const j = dCourse.incompatible[i]?.id.toString();
					if (c === j) {
						return true;
					}
				}
				return false;
			});

			//Get all of the appropiate id's, apply class
			for (const a in allCourses) {
				const existingTable = document.getElementById("mainTable");
				console.log(allCourses[a]);
				if (existingTable) {
					const existingIncompatible =
						existingTable.querySelectorAll<HTMLElement>(
							`[id*="${allCourses[a]?.toUpperCase()}"]`,
						);
					existingIncompatible.forEach((el) => {
						console.log(el);
						el.classList.add("incompatible-true");
					});
				}
			}
		}
	}
};
</script>

<template>
	<button
		type="button"
		class="list-group-item w-100 course-selection"
		:class="{
			'course-selection-active':
				selectedState === courseAPI.codeFrom(course?.id) ||
				checkAdvanced(course),
		}"
		:id="'vue-LeftOptionCourse-' + course?.code"
		@click="selectCourse(course)"
	>
		<template v-if="!error">
			<template v-if="!isInPlanner && !advancedCourse">
				<h4 class="text-center">
					{{ course?.code }}: {{ course?.name }} (<i>{{ sems }}</i
					>)
				</h4>
				<p class="m-0 p-0" v-if="prereqs_list">
					Prerequisites: <i>{{ prereqs_list }}</i>
				</p>
				<p class="m-0 p-0" v-if="incompatible_list">
					Incompatible: <i>{{ incompatible_list }}</i>
				</p>
			</template>
			<template v-else-if="!isInPlanner && advancedCourse">
				<h4 class="text-center" :id="'vue-Upper-' + course?.code">
					<span
						@click="toggle_adv(course, course)"
						:id="'vue-Span-' + course?.code"
						>{{ course?.code }}</span
					>
					|
					<span
						class="gray-text"
						@click="toggle_adv(course, getAdvancedCourse(course))"
						:id="'vue-Span-' + getAdvancedCourse(course)?.code"
						>{{ getAdvancedCourse(course).code }}</span
					>
				</h4>
				<h4 class="text-center" :id="'vue-Title-' + course?.code">
					{{ course?.name }} (<i>{{ sems }}</i
					>)
				</h4>
				<p
					class="m-0 p-0"
					v-if="prereqs_list"
					:id="'vue-Prereqs-' + course?.code"
				>
					Prerequisites: <i>{{ prereqs_list }}</i>
				</p>
				<p
					class="m-0 p-0"
					v-if="incompatible_list"
					:id="'vue-Incomp-' + course?.code"
				>
					Incompatible: <i>{{ incompatible_list }}</i>
				</p>
				<i class="fa-solid fa-comet"></i>
			</template>
			<template v-else-if="isInPlanner && !advancedCourse">
				<h6 class="text-center gray-text">
					{{ course?.code }}:
					<i>{{ semesterOfCourseInPlannerWhichThePersonIsTaking }}</i>
				</h6>
			</template>

			<template v-else-if="isInPlanner">
				<h6 class="text-center gray-text">
					<span :id="`vue-Unav-` + course.code">{{
						getCourseCode(course)
					}}</span
					>:
					<i>{{ semesterOfCourseInPlannerWhichThePersonIsTaking }}</i>
				</h6>
			</template>

			<template v-else>
				<ErrorView :err="new Error(`Course couldn't be shown`)" />
			</template>
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
