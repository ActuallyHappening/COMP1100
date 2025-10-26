import { inject, reactive, ref, provide, watch } from "vue";

import _ from "lodash";
import type { Course } from "./db/course";

export type Filter = {
	search: string;
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
	filterCourses(courses: Course[]): {
		courses: Course[];
		message: string | undefined;
	} {
		// TODO
		return { courses, message: "TODO" };
	},
	clear() {
		filters.value = defaultFilter();
	},
};
