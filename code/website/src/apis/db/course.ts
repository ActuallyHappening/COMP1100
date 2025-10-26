import { RecordId } from "surrealdb";
import { ref } from "vue";
import { assert_id, id_eq } from "../db";
import { toast } from "vue3-toastify";

export const courses = ref(null as Course[] | null);

export type Prereq = ("OR" | "AND" | RecordId<string> | Prereq)[];
export type Course = {
	id: RecordId<string>;
	code: string;
	cp: number;
	name: string;
	prerequisites: Prereq;
	incompatible: RecordId<string>[];
	sem_1: boolean;
	sem_2: boolean;
	sem_summer: boolean;
};

export const error_course = (msg: string): Course => {
	return {
		id: new RecordId("course", `Error: ${msg}`),
		code: msg,
		cp: 2,
		name: msg,
		prerequisites: [],
		incompatible: [],
		sem_1: false,
		sem_2: false,
		sem_summer: false,
	};
};

export const courseAPI = {
	getAll(): Course[] | null {
		const ret = courses.value as Course[] | null;
		if (!ret) {
			toast(`Courses not loaded yet`, { type: "info" });
		}
		return ret;
	},
	getCourse(id: RecordId<string>): Course | undefined {
		assert_id(id);
		const all = this.getAll();
		if (!all) {
			return;
		}
		const ret = all.find((course) => id_eq(course.id, id));
		if (!ret) {
			toast(`Course ${id.id} not found in our database yet`, {
				type: "warning",
			});
		}
		return ret;
	},
	getCourseOrErr(id: RecordId<string>): Course {
		const course = this.getCourse(id);
		if (!course) {
			throw new Error(`Course ${id.id} not found in our database yet`);
		}
		return course;
	},
};
