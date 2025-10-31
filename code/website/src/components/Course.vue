<script lang="ts" setup>
import { defineProps, computed, ref } from "vue";
import ErrorView from "../Error.vue";
import _ from "lodash";
import {
	courseAPI,
	type Course,
	error_course,
	type Prereq,
} from "../apis/db/course";
import { selectedState } from "../apis/state";
import { planAPI } from "../apis/plan";
import { plannerAPI, type SemId } from "../apis/planner";
import { RecordId } from "surrealdb";
import { filters } from "../apis/filter";

const props = defineProps({
	code: {
		required: true,
		type: String,
	},
	type: {
		required: true,
		type: String,
		default: "default",
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
const renderPrereq = (
	arr: Prereq,
	options?: { course_cb?: (id: string) => string },
): string => {
	const settings = {
		course_cb: (id: string) => id.toUpperCase(),
		...options,
	};
	const ret = [];
	for (const idiom of arr) {
		if (idiom === "OR" || idiom === "AND") {
			ret.push(idiom.toLowerCase());
		} else if (idiom instanceof RecordId) {
			ret.push(settings.course_cb(idiom.id.toString()));
		} else if (typeof idiom === "object") {
			ret.push("(" + renderPrereq(idiom, settings) + ")");
		} else {
			throw TypeError();
		}
	}
	return ret.join(" ");
};
const prereqs_list = computed(() => {
	if (course.value?.prerequisites) {
		return renderPrereq(course.value?.prerequisites);
	} else {
		return "";
	}
});
const prereqs_list_html = computed(() => {
	if (course.value?.prerequisites) {
		return renderPrereq(course.value?.prerequisites, {
			course_cb: (id: string) =>
				`<a href="#${id}">${id.toUpperCase()}</a>`,
		});
	} else {
		return "";
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
const selectCourse = () => {
	switch (props.type) {
		case "default":
			if (selectedState.value == course.value.id.toString()) {
				// already selected
				selectedState.value = undefined;
			} else {
				console.info(`Selecting course: `, course.value.id);
				selectedState.value = course.value.id.id.toString();

				//Code to highlight th's for prerequisites. May need to be moved
				//Code to find eligible semesters
				let sems = Object.keys(planAPI.getCurrent().planner);
				let oppSems = sems;

				//Remove existing styling if applicable
				for (const c in sems) {
					const divName = sems[c]?.toString();
					const divItem = document.getElementById(divName);
					if (divItem) {
						divItem.classList.remove("prereq-success");
						divItem.classList.remove("prereq-fail");
						divItem.classList.remove("prereq-unavailable");
						const headerRow = divItem.parentElement;
						const tds = Array.from(
							headerRow?.querySelectorAll("td"),
						);
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
					elements.forEach((el) =>
						el.classList.remove(classNameToRemove),
					);
				}

				//Filter out to only required semsters
				sems = sems.filter((semester) => {
					if (semester.includes("Sem 1")) {
						if (course.value.sem_1) {
							return true;
						} else {
							return false;
						}
					} else if (semester.includes("Sem 2")) {
						if (course.value.sem_2) {
							return true;
						} else {
							return false;
						}
					} else {
						if (course.value.sem_summer) {
							return true;
						} else {
							return false;
						}
					}
				});

				oppSems = oppSems.filter((semester) => {
					if (sems.includes(semester)) {
						return false;
					}
					return true;
				});

				// Getting all the previous courses for each of the sems available
				let semsBeforeLists: { [key: SemId]: Course[] } = {};
				for (const c in sems) {
					semsBeforeLists[sems[c]] = plannerAPI(
						planAPI.getCurrent().planner,
					).prereqCheck({
						previousCourses: plannerAPI(
							planAPI.getCurrent().planner,
						).previousCoursesTo(sems[c], course.value),
						thisCourse: course.value,
					});
				}

				// Updating classes of table th's to show available sems
				for (const c in sems) {
					const semDiv = document.getElementById(sems[c]?.toString());
					if (semDiv) {
						if (semsBeforeLists[sems[c]]) {
							semDiv.classList.add("prereq-success");
						} else {
							semDiv.classList.add("prereq-fail");
						}
					}
				}

				// Making the rest of the divs unavailable
				for (const c in oppSems) {
					const semDiv = document.getElementById(
						oppSems[c]?.toString(),
					);
					if (semDiv) {
						semDiv.classList.add("prereq-unavailable");
						const headerRow = semDiv.parentElement;
						const tds = Array.from(
							headerRow?.querySelectorAll("td"),
						);
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
					for (const i in course.value.incompatible) {
						const j = course.value.incompatible[i]?.id.toString();
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
			break;
		case "small":
			for (const a in planAPI.getCurrent().planner) {
				if (planAPI.getCurrent().planner[a].includes(course.value.id.id.toString())) {
					selectedState.value = course.value.id.id.toString();
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
const prereqChecked = computed(() => {
	const planner = plannerAPI(planAPI.getCurrent().planner);
	const previous = previousCourses.value;
	if (!previous) {
		return;
	}
	const prereqCheck = planner.prereqCheck({
		previousCourses: previous,
		thisCourse: course.value,
	});
	return prereqCheck;
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

const isInPlanner = computed((): boolean => {
	const rawPlan = planAPI.getCurrent().planner;
	const planner = plannerAPI(rawPlan);
	const inPlanner = planner.getIndexOfCourse(course.value.id);
	if (!inPlanner) {
		return false;
	} else {
		return true;
	}
});

const semesterOfCourseInPlannerWhichThePersonIsTaking = computed(
	(): SemId | undefined => {
		const rawPlan = planAPI.getCurrent().planner;
		const planner = plannerAPI(rawPlan);
		const inPlanner = planner.getIndexOfCourse(course.value.id);
		if (inPlanner) {
			return inPlanner[0];
		} else {
			return undefined;
		}
	},
);

const close = () => {
	// remove this from selected and from visual planner
	const planner = plannerAPI(planAPI.getCurrent().planner);
	planner.removeCourse(course.value.id);
	// Deleting a course selects it, CY Interview 1 mentinos this isn't desired behaviour
	selectedState.value = undefined;
	for (const c in sems) {
		const divName = sems[c]?.toString();
		const divItem = document.getElementById(divName);
		if (divItem) {
			divItem.classList.remove("prereq-success");
			divItem.classList.remove("prereq-fail");
			divItem.classList.remove("prereq-unavailable");
			const headerRow = divItem.parentElement;
			const tds = Array.from(
				headerRow?.querySelectorAll("td"),
			);
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
			const tds = Array.from(
				headerRow?.querySelectorAll("td"),
			);
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
};
</script>

<template>
	<button
		type="button"
		class="list-group-item w-100"
		:class="{
			'course-selection-active':
				type === 'default' &&
				selectedState === course?.id.id.toString().toLowerCase(),
			'course-selection': type === 'default',
		}"
		:id="'vue-Course-' + course?.code"
		@click="selectCourse"
	>
		<template v-if="!error">
			<template v-if="type === 'default' && !isInPlanner">
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
				<i class="fa-solid fa-comet"></i>
			</template>

			<template v-else-if="type === 'default' && isInPlanner">
				<h6 class="text-center gray-text">
					{{ course?.code }}:
					<i>{{ semesterOfCourseInPlannerWhichThePersonIsTaking }}</i>
				</h6>
			</template>

			<template v-else-if="type === 'small'">
				<div class="justify-content-end d-flex">
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
				<p class="m-0 p-0">Core course</p>
				<p class="m-0 p-0">
					Prereqs passed:
					<span :class="{ 'text-warning': !prereqChecked }">{{
						prereqChecked ? "✅" : "⚠"
					}}</span>
				</p>
			</template>

			<template v-else-if="type === 'summary'">
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
						<p v-if="prereqChecked">
							You have completed all necessary prerequisites to
							begin this course.
						</p>
						<p v-else-if="prereqs_list && !prereqChecked">
							You need to complete:
						</p>
					</li>
					<li v-if="incompatible_list">
						<h5><strong>Incompatibilities:</strong></h5>
						<!-- shows up optionally? -->
						<p>
							{{ course?.code }} is incompatible with
							{{ incompatible_list }}.
						</p>
						<!-- <p>Please </p> -->
					</li>
					<li>
						<h5><strong>Credits:</strong></h5>
						<p>This course counts _ towards _.</p>
					</li>
				</ul>
			</template>

			<template v-else>
				<ErrorView
					:err="
						new Error(
							`Unknown course type <Course type='${type}' />`,
						)
					"
				/>
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
</style>
