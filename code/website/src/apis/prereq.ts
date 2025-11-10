import { RecordId } from "surrealdb";
import _ from "lodash";

type Idiom = "OR" | "AND" | RecordId<string> | Prereq;
export type Prereq = Idiom[];

export function isLogicalConjunction(idiom: Idiom): idiom is "AND" | "OR" {
	return idiom === "AND" || idiom === "OR";
}

export const DIDNT_EXPECT_LOGICAL_CONJUNCTION =
	"https://github.com/ActuallyHappening/COMP1100/blob/master/code/website/src/apis/prereq.md#did-not-expect-a-logical-conjunction";

export type PrereqAPI = ReturnType<typeof prereqAPI>;
export const prereqAPI = (prereq: Prereq) => ({
	getPrereq() {
		return prereq;
	},
	render(options?: { course_cb?: (id: string) => string }) {
		const settings = {
			course_cb: (id: string) => id.toUpperCase(),
			...options,
		};

		this.checkSelf();

		const ret = [];
		for (const idiom of prereq) {
			ret.push(this.renderIdiom(idiom, settings));
		}
		return ret.join(" ");
	},
	renderIdiom(
		idiom: Idiom,
		options?: {
			course_cb?: (id: string) => string;
		},
	): string {
		const settings = {
			course_cb: (id: string) => id.toUpperCase(),
			...options,
		};

		let ret = "";
		if (isLogicalConjunction(idiom)) {
			ret = idiom.toLowerCase();
		} else if (idiom instanceof RecordId) {
			ret = settings.course_cb(idiom.id.toString());
		} else if (typeof idiom === "object" && _.isArray(idiom)) {
			const arr = [];
			for (const subIdiom of idiom) {
				arr.push(this.renderIdiom(subIdiom, options));
			}
			ret = "(" + arr.join(" ") + ")";
		} else {
			throw TypeError();
		}
		return ret;
	},
	checkSelf(options?: { prereq?: Prereq }) {
		const settings = {
			prereq: undefined,
			...options,
		};
		const idiom = settings.prereq ?? prereq;
		let expectingLogicalConjunction = false;
		if (isLogicalConjunction(idiom) && !expectingLogicalConjunction) {
			throw new Error(
				`Didn't expect a logical conjunction but got ${subIdiom} one anyway, in prereq: ${prereq}\n${DIDNT_EXPECT_LOGICAL_CONJUNCTION}`,
			);
		}
		expectingLogicalConjunction = !expectingLogicalConjunction;
	},
	cleanSelf() {
		// pass 1: arrays with only one item may be propogated up
	},
	fillInPrereqs(options: {}): PrereqPI {},
});
