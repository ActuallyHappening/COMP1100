import { RecordId } from "surrealdb";
import _ from "lodash";

export type Prereq = "OR" | "AND" | RecordId<string> | Prereq[];

export function isLogicalConjunction(idiom: Prereq): idiom is "AND" | "OR" {
	return idiom === "AND" || idiom === "OR";
}

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
		if (isLogicalConjunction(idiom)) {
			ret = idiom.toLowerCase();
		} else if (idiom instanceof RecordId) {
			ret = settings.course_cb(idiom.id.toString());
		} else if (typeof idiom === "object" && _.isArray(idiom)) {
			const arr = [];
			let expectedLogicalConjunction = false;
			for (const subIdiom of idiom) {
				if (isLogicalConjunction(subIdiom) && !expectedLogicalConjunction) {
					throw new Error(
						`Didn't expect a logical conjunction but got ${subIdiom} one anyway, in prereq: ${prereq}`,
					);
				}
				expectedLogicalConjunction = !expectedLogicalConjunction;
				arr.push(this.renderPrereq({ ...settings, prereq: subIdiom }));
			}
			ret = "(" + arr.join(" ") + ")";
		} else {
			throw TypeError();
		}
		return ret;
	},
});
