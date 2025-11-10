import { RecordId } from "surrealdb";
import _ from "lodash";

export type Prereq = "OR" | "AND" | RecordId<string> | Prereq[];

export function isLogicalConjunction(idiom: Prereq): idiom is "AND" | "OR" {
	return idiom === "AND" || idiom === "OR";
}

export const DIDNT_EXPECT_LOGICAL_CONJUNCTION =
	"https://github.com/ActuallyHappening/COMP1100/blob/master/code/website/src/apis/prereq.md#did-not-expect-a-logical-conjunction";

export const prereqAPI = (prereq: Prereq) => ({
	renderPrereq(options?: {
		course_cb?: (id: string) => string;
		prereq?: Prereq;
		nested?: boolean;
	}): string {
		const settings = {
			course_cb: (id: string) => id.toUpperCase(),
			prereq: undefined,
			nested: false,
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
						`Didn't expect a logical conjunction but got ${subIdiom} one anyway, in prereq: ${prereq}\n${DIDNT_EXPECT_LOGICAL_CONJUNCTION}`,
					);
				}
				expectedLogicalConjunction = !expectedLogicalConjunction;
				arr.push(
					this.renderPrereq({ ...settings, prereq: subIdiom, nested: true }),
				);
			}
			if (settings.nested) {
				ret = "(" + arr.join(" ") + ")";
			} else {
				ret = arr.join(" ");
			}
		} else {
			throw TypeError();
		}
		return ret;
	},
});
