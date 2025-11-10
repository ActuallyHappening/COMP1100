import { inject, reactive, ref, provide, watch } from "vue";

import _ from "lodash";
import type { Course } from "./db/course";

export type Filter = {
	search: string;
	// placedCourse: string;
	// removedCourse: string;
	sem_1: boolean;
	sem_2: boolean;
	sem_summer: boolean;
};
const defaultFilter = (): Filter =>
	_.cloneDeep({
		search: "",
		// placedCourse: "",
		// removedCourse: "",
		sem_1: false,
		sem_2: false,
		sem_summer: false,
	});

export const filters = ref(defaultFilter());
// let activeAdd = undefined;
// let activeRemove = undefined;
// let newActiveAdd = undefined;
// let newActiveRemove = undefined;
// let adding = false;
// let removing = false;

export const filterAPI = {
	filterCourses(
		courses: Course[],
		coursesInPlan: string[],
	): {
		courses: Course[];
		message: string | undefined;
	} {
		let remaining_courses = courses
			.filter((course) => {
				if (filters.value.sem_1 && course.sem_1 === false) {
					return false;
				}
				return true;
			})
			.filter((course) => !(filters.value.sem_2 && !course.sem_2))
			.filter((course) => !(filters.value.sem_summer && !course.sem_summer))
			.filter((course) => {
				if (!filters.value.search) {
					return true;
				}
				const str = course.name.toLowerCase() + "|" + course.code.toLowerCase();
				return str.includes(filters.value.search.toLowerCase());
			});
		// prioritize course codes that match search first, then name
		const codeRemaining = remaining_courses.filter((course) => {
			if (!filters.value.search) {
				return true;
			}
			return course.code
				.toLowerCase()
				.includes(filters.value.search.toLowerCase());
		});
		const nameRemaining = remaining_courses.filter((course) => {
			if (!filters.value.search) {
				return true;
			}
			return course.name
				.toLowerCase()
				.includes(filters.value.search.toLowerCase());
		});
		remaining_courses = _.uniq([...codeRemaining, ...nameRemaining]);

		let filterMessage = "";
		if (courses.length !== remaining_courses.length) {
			const dif = courses.length - remaining_courses.length;
			filterMessage = `Filtered ${dif} courses out`;
		}
		return { courses: remaining_courses, message: filterMessage };
	},
	clear() {
		filters.value = defaultFilter();
	},
	clearSems() {
		this.setSems({ sem_1: false, sem_2: false, sem_summer: false });
	},
	sems() {
		return {
			sem_1: filters.value.sem_1,
			sem_2: filters.value.sem_2,
			sem_summer: filters.value.sem_summer,
		};
	},
	setSems(newVal: { sem_1: boolean; sem_2: boolean; sem_summer: boolean }) {
		filters.value.sem_1 = newVal.sem_1;
		filters.value.sem_2 = newVal.sem_2;
		filters.value.sem_summer = newVal.sem_summer;
	},
	sem1OnlyMask: {
		sem_1: true,
		sem_2: false,
		sem_summer: false,
	},
	sem1Active() {
		return _.isEqual(this.sems(), this.sem1OnlyMask);
	},
	sem1Pressed() {
		if (!this.sem1Active()) {
			// active
			this.setSems(this.sem1OnlyMask);
		} else {
			this.clearSems();
		}
	},
	sem2OnlyMask: {
		sem_1: false,
		sem_2: true,
		sem_summer: false,
	},
	sem2Active() {
		return _.isEqual(this.sems(), this.sem2OnlyMask);
	},
	sem2Pressed() {
		if (!this.sem2Active()) {
			// active
			this.setSems(this.sem2OnlyMask);
		} else {
			this.clearSems();
		}
	},
	sem1AndSem2Mask: {
		sem_1: true,
		sem_2: true,
		sem_summer: false,
	},
	sem1AndSem2Active() {
		return _.isEqual(this.sems(), this.sem1AndSem2Mask);
	},
	sem1AndSem2Pressed() {
		if (!this.sem1AndSem2Active()) {
			// active
			this.setSems(this.sem1AndSem2Mask);
		} else {
			this.clearSems();
		}
	},
	semSummerOnlyMask: {
		sem_1: false,
		sem_2: false,
		sem_summer: true,
	},
	semSummerActive() {
		return _.isEqual(this.sems(), this.semSummerOnlyMask);
	},
	semSummerPressed() {
		if (!this.semSummerActive()) {
			// active
			this.setSems(this.semSummerOnlyMask);
		} else {
			this.clearSems();
		}
	},
};
