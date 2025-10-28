import { inject, reactive, ref, provide, watch } from "vue";

import _ from "lodash";
import type { Course } from "./db/course";

export type Filter = {
	search: string;
	placedCourse: string;
	sem_1: boolean;
	sem_2: boolean;
	sem_summer: boolean;
};
const defaultFilter = (): Filter =>
	_.cloneDeep({
		search: "",
		sem_1: false,
		sem_2: false,
		sem_summer: false,
	});

export const filters = ref(defaultFilter());

export const filterAPI = {
	filterCourses(courses: Course[], coursesInPlan: string[]): {
		courses: Course[];
		message: string | undefined;
	} {
		// TODO
		let remaining_courses = courses
			.filter((course) => {
				if (coursesInPlan.includes(course.code.toLowerCase())) {
					return false;
				}
				return true;
			})
			.filter((course) => {
				if (filters.value.placedCourse) {
					if (filters.value.placedCourse === course.code.toLowerCase()) {
						return false;
					};
				};
				return true;
			})
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
};
