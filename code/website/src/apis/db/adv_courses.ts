import { RecordId } from "surrealdb";
import { ref } from "vue";
import { toast } from "vue3-toastify";
import { programAPI } from "./program";

export const adv_courses = ref(null as AdvCourse[] | null);

export type AdvCourse = {
    id: RecordId<string>;
    course: RecordId<string>;
    adv_course: RecordId<string>;
    program: RecordId<string>;
};

export const error_course = (msg: string): AdvCourse => {
    return {
        id: new RecordId("adv_course", `Error: ${msg}`),
        course: new RecordId("adv_course", `Error: ${msg}`),
        adv_course: new RecordId("adv_course", `Error: ${msg}`),
        program: new RecordId("adv_course", `Error: ${msg}`),
    };
};

let toasted_ran = false

export const advCoursesAPI = {
    getAll(): AdvCourse[] | null {
        const ret = adv_courses.value as AdvCourse[] | null;
        if (!ret && !toasted_ran) {
            toast(`Advanced courses not loaded yet`, { type: "info" });
            toasted_ran = true
        }
        return ret;
    },
    getCurrent(): AdvCourse[] | null {
        let allAdvs = this.getAll();
        if (allAdvs) {
            allAdvs = allAdvs?.filter((advCourse) => {
                if (advCourse.program.id === programAPI.getCurrent()?.id.id) {
                    return true;
                }
                return false;
            });
        };
        return allAdvs;
    }
};