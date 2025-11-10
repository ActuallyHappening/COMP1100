<script lang="ts" setup>
import { defineProps, computed, ref, toRaw } from "vue";
import ErrorView from "../../Error.vue";
import _ from "lodash";
import { courseAPI, type Course, error_course } from "../../apis/db/course";
import { selectedState } from "../../apis/state";
import { planAPI } from "../../apis/plan";
import { plannerAPI, type SemId } from "../../apis/planner";
import { cpAPI } from "../../apis/cpallocation";
import { programRequirementAPI } from "../../apis/db/program_requirement";
import { advCoursesAPI } from "../../apis/db/adv_courses";
import { prereqAPI, PrereqAPI } from "../../apis/prereq";

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

const course_cb = (id: string) => `<a href="#${id}">${id.toUpperCase()}</a>`;

const inPlanner = computed((): boolean => {
	const planner = plannerAPI(planAPI.getCurrent().planner);
	const sem_index = planner.getIndexOfCourse(course.value.id);
	if (!sem_index) {
		return false;
	} else {
		return true;
	}
});

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

const prereqsHTML = computed((): undefined | string => {
	let alreadyDoneCourses = undefined as Course[] | undefined;
	if (inPlanner.value) {
		const _previousCourses = previousCourses.value;
		if (!_previousCourses) {
			throw Error();
		}
		alreadyDoneCourses = _previousCourses;
	} else {
		// get all courses in planner
		alreadyDoneCourses = plannerAPI(planAPI.getCurrent().planner)
			.getAllCourses()
			.map((course) => courseAPI.getOrError(course));
	}
	const prereqs = course.value.prerequisites;
	if (!prereqs) {
		return undefined;
	}
	const relevantCourses = prereqAPI(prereqs).relevantCourses(
		alreadyDoneCourses.map((course) => course.id),
	);

	// TODO use HTML links
	const relevantPrereqsAlreadyCompletedHtml =
		"Assuming you do/have done these courses: " +
		relevantCourses
			.map((course) => course_cb(courseAPI.codeFrom(course)))
			.join(", ");
	const prereq = new PrereqAPI(prereqs).fillKnownCourses(relevantCourses);
	if (prereq === true) {
		throw Error();
	}
	const prereqHtml =
		" ... you only need to satisfy these conditions: " +
		prereq.render({ course_cb });
	return relevantPrereqsAlreadyCompletedHtml + prereqHtml;
});

const prereqs_list = computed(() => {
	if (course.value?.prerequisites) {
		return prereqAPI(course.value?.prerequisites).render();
	} else {
		return "";
	}
});

const prereqs_list_html = computed(() => {
	if (course.value?.prerequisites) {
		return prereqAPI(course.value?.prerequisites).render({
			course_cb,
		});
	} else {
		return "";
	}
});

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

const allocated = (course: Course) => {
	const allCp = cpAPI.getCourseAssignments();
	for (const a in allCp) {
		for (const b in allCp[a].courses) {
			if (allCp[a].courses[b].id.id === course.id.id) {
				for (const b in programRequirementAPI.getAll()) {
					if (programRequirementAPI.getAll()[b].id.id === a) {
						return programRequirementAPI
							.getAll()
							[b].short_name.toLowerCase();
					}
				}
				return false;
			}
		}
	}
	return false;
};

const deselect = () => {
	selectedState.value = undefined;
	let sems = Object.keys(planAPI.getCurrent().planner);

	//Remove existing styling if applicable
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
	const nowTable = document.getElementById("mainTable");
	const classNameToRemove = "incompatible-true";
	if (nowTable) {
		const elements = nowTable.querySelectorAll<HTMLElement>(
			`.${classNameToRemove}`,
		);
		elements.forEach((el) => el.classList.remove(classNameToRemove));
	}
};
</script>

<template>
	<button
		type="button"
		class="list-group-item w-100"
		:id="'vue-RightSummaryCourse-' + course?.code"
	>
		<template v-if="!error">
			<div class="d-flex justify-content-center">
				<a
					class="mb-2"
					:href="
						'https://programs-courses.uq.edu.au/course.html?course_code=' +
						course?.code
					"
					target="_blank"
				>
					<h3 class="text-center">{{ course?.code }}</h3>
					<p class="text-center">{{ course?.name }}</p>
				</a>
				<button
					type="button"
					class="btn-close btn-deselect align-self-start"
					aria-label="Close"
					@click.prevent="deselect"
				></button>
			</div>
			<ul class="text-start">
				<li>
					<h5>
						<strong
							>Semesters offered:
							<span
								title="Based on previous course offerings.
							Information may not be valid in future semesters."
								>&#9432;</span
							></strong
						>
					</h5>
					<p>
						{{ course?.code }} is available in the following
						semesters: {{ sems }}
					</p>
				</li>
				<li>
					<h5><strong>Prerequisites:</strong></h5>
					<p v-if="prereqs_list" v-html="prereqs_list_html"></p>
					<p v-else>
						{{ course?.code }} has no prerequisite courses.
					</p>
					<!-- <p v-if="inPlanner && prereqChecked === true">
						You have completed all necessary prerequisites to begin
						this course.
					</p>
					<p v-else-if="inPlanner && prereqChecked === false">
						You need to complete: {{ prereqs_list_modified }}
					</p> -->
					<p v-if="prereqsHTML" v-html="prereqsHTML"></p>
				</li>
				<li v-if="incompatible_list">
					<h5><strong>Incompatibilities:</strong></h5>
					<p>
						{{ course?.code }} is incompatible with
						{{ incompatible_list }}.
					</p>
				</li>
				<li>
					<h5><strong>Credits:</strong></h5>
					<template v-if="allocated(course)">
						<p>
							This course counts {{ course.cp }} points towards
							{{ allocated(course) }}.
						</p>
					</template>
					<template v-if="!allocated(course)">
						<template v-if="cpAPI.getHighestOrderLevel(course)">
							<p>
								This course counts {{ course.cp }} points
								towards
								{{
									cpAPI
										.getHighestOrderLevel(course)
										.short_name.toLowerCase()
								}}.
							</p>
						</template>
					</template>
				</li>
			</ul>
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
