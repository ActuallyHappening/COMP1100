<script lang="ts" setup>
import { defineProps, computed, ref, toRaw } from "vue";
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
import { cpAPI } from "../apis/cpallocation";
import { programRequirementAPI } from "../apis/db/program_requirement";
import { advCoursesAPI } from "../apis/db/adv_courses";
import { prereqAPI } from "../apis/prereq";

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
const prereqs_list = computed(() => {
	if (course.value?.prerequisites) {
		return prereqAPI(course.value?.prerequisites).render();
	} else {
		return "";
	}
});
function removePrereq(
	prereqs: Prereq,
	parser: boolean,
	course: RecordId<string>,
) {
	let counter = -1;
	const inPlan = plannerAPI(planAPI.getCurrent().planner).getIndexOfCourse(
		course,
	);
	let flattenedCourses: Course[] = [];
	if (!inPlan) {
		for (const a in planAPI.getCurrent().planner) {
			for (const b in planAPI.getCurrent().planner[a]) {
				if (planAPI.getCurrent().planner[a][b]) {
					const cCode = courseAPI.code(
						planAPI.getCurrent().planner[a][b],
					);
					flattenedCourses.push(cCode.id);
				}
			}
		}
	} else {
		let planObject = plannerAPI(
			planAPI.getCurrent().planner,
		).previousCoursesTo(inPlan[0], course);
		for (const p of planObject) {
			flattenedCourses.push(p.id.id);
		}
	}
	let ors = false;
	let ands = false;
	if (prereqs[1] === "OR") {
		ors = true;
	} else {
		ands = true;
	}
	let ultimateQuit = false;
	for (const prereq in prereqs) {
		if (Array.isArray(prereqs[prereq]) && !(prereqs[prereq].length === 0)) {
			prereqs[prereq] = removePrereq(prereqs[prereq], true, course);
		}
	}
	prereqs = prereqs.filter((prereq) => {
		counter += 1;
		if (counter % 2 === 0) {
			if (prereq) {
				if (flattenedCourses.includes(prereq.id)) {
					if (ors) {
						ultimateQuit = true;
					}
					return false;
				}
			} else {
				return false;
			}
		}
		return true;
	});
	if (ands) {
		counter = -1;
		prereqs = prereqs.filter((prereq) => {
			if (prereq.length === 0) {
				return false;
			}
			return true;
		});
		let preLen = prereqs.length;
		prereqs = prereqs.filter((prereq) => {
			counter += 1;
			if (
				counter + 1 < preLen &&
				prereqs[counter] === prereqs[counter + 1]
			) {
				return false;
			} else if (counter + 1 === preLen && prereq === "AND") {
				return false;
			} else if (counter === 0 && prereq === "AND") {
				return false;
			}
			return true;
		});
	}
	if (ultimateQuit) {
		return undefined;
	} else if (parser) {
		return prereqs;
	} else {
		if (prereqs && !(prereqs.length === 0)) {
			return newRenderPrereq(prereqs);
		} else {
			return "All prerequisites are currently in the plan";
		}
	}
}
function newRenderPrereq(prereqs: any[]) {
	let finalString = "";
	console.log(prereqs);
	if (Array.isArray(prereqs[0])) {
		if (prereqs.length === 1) {
			finalString += "(" + newRenderPrereq(prereqs[0]) + ")";
		} else {
			finalString +=
				"(" +
				newRenderPrereq(prereqs[0]) +
				") " +
				prereqs[1].toLowerCase() +
				" " +
				newRenderPrereq(prereqs.slice(2));
		}
		return finalString;
	} else if (prereqs.length === 1) {
		finalString += prereqs[0].id.toUpperCase();
		return finalString;
	}
	console.log(prereqs.slice(2));
	finalString =
		prereqs[0].id.toUpperCase() +
		" " +
		prereqs[1].toLowerCase() +
		" " +
		newRenderPrereq(prereqs.slice(2));
	return finalString;
}
const prereqs_list_modified = computed(() => {
	if (course.value?.prerequisites) {
		let answer = removePrereq(
			structuredClone(toRaw(course.value?.prerequisites)),
			false,
			course.value.id,
		);
		if (!answer) {
			return "All prerequisites are currently in the plan";
		}
		return answer;
	} else {
		return "All prerequisites are currently in the plan";
	}
});
const prereqs_list_html = computed(() => {
	if (course.value?.prerequisites) {
		return prereqAPI(course.value?.prerequisites).render({
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
const selectCourse = (obCourse: Course) => {
	let dCourse = course.value;
	switch (props.type) {
		case "default":
			break;
		case "small":
			for (const a in planAPI.getCurrent().planner) {
				if (
					planAPI
						.getCurrent()
						.planner[a].includes(dCourse.id.id.toString())
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
						const buttons = Array.from(
							tds[td]?.querySelectorAll("button"),
						);
						for (const button in buttons) {
							buttons[button]?.classList.remove("disabled");
						}
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




function getCourseCode(course: Course) {
	if (plannerAPI(planAPI.getCurrent().planner).getIndexOfCourse(course.id)) {
		return course.code;
	} else if (
		plannerAPI(planAPI.getCurrent().planner).getIndexOfCourse(
			getAdvancedCourse(course).id,
		)
	) {
		return getAdvancedCourse(course).code;
	} else {
		return undefined;
	}
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
		:class="{
			'course-selection-active':
				type === 'default' &&
				(selectedState === course?.id.id.toString().toLowerCase() ||
					checkAdvanced(course)),
			'course-selection': type === 'default',
		}"
		:id="'vue-Course-' + course?.code"
		@click="selectCourse(course)"
	>
		<template v-if="!error">
			<template
				v-if="type === 'default' && !isInPlanner && !advancedCourse"
			>
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
			<template
				v-else-if="type === 'default' && !isInPlanner && advancedCourse"
			>
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
			<template
				v-else-if="type === 'default' && isInPlanner && !advancedCourse"
			>
				<h6 class="text-center gray-text">
					{{ course?.code }}:
					<i>{{ semesterOfCourseInPlannerWhichThePersonIsTaking }}</i>
				</h6>
			</template>

			<template v-else-if="type === 'default' && isInPlanner">
				<h6 class="text-center gray-text">
					<span :id="`vue-Unav-` + course.code">{{
						getCourseCode(course)
					}}</span
					>:
					<i>{{ semesterOfCourseInPlannerWhichThePersonIsTaking }}</i>
				</h6>
			</template>

			<template v-else-if="type === 'small'">
				<div class="justify-content-end d-flex">
					<div title="Core Course">
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
				<p class="m-0 p-0">Core course</p>
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
						<p v-if="prereqChecked === true">
							You have completed all necessary prerequisites to
							begin this course.
						</p>
						<p v-else-if="prereqChecked === false">
							You need to complete: {{ prereqs_list_modified }}
						</p>
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
								This course counts {{ course.cp }} points
								towards {{ allocated(course) }}.
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
