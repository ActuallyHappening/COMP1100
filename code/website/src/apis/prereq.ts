import type { RecordId } from "surrealdb";
import _ from "lodash";

export type Prereq = "OR" | "AND" | RecordId<string> | Prereq[];

export const prereqAPI = (prereq: Prereq) => ({
	renderPrereq(options?: {
		course_cb?: (id: string) => string;
		prereq?: Prereq;
	}): string {
		const settings = {
			course_cb: (id: string) => id.toUpperCase(),
			prereq: undefined,
			...options,
		};
		const idiom = settings.prereq ?? prereq;
		let ret = "";
		if (idiom === "OR" || idiom === "AND") {
			ret = idiom.toLowerCase();
		} else if (idiom instanceof RecordId) {
			ret = settings.course_cb(idiom.id.toString());
		} else if (typeof idiom === "object" && _.idArray(idiom)) {
			ret.push("(" + renderPrereq(idiom, settings) + ")");
		} else {
			throw TypeError();
		}
		return ret;
	},
});
