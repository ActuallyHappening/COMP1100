import { RecordId } from "surrealdb";
import _ from "lodash";

type Idiom = "OR" | "AND" | RecordId<string> | Prereq;
export type Prereq = Idiom[];

export const idiomDiscriminant = (idiom: Idiom) => {
	if (idiom === "OR" || idiom === "AND") {
		return { logicalConjunction: idiom };
	} else if (idiom instanceof RecordId) {
		return { course: idiom };
	} else if (_.isArray(idiom)) {
		return { prereq: idiom };
	} else {
		const error = new TypeError(`Unrecognised idiom: ${JSON.stringify(idiom)}`);
		throw error;
	}
};

export function isLogicalConjunction(idiom: Idiom): idiom is "AND" | "OR" {
	return idiom === "AND" || idiom === "OR";
}

export const DIDNT_EXPECT_LOGICAL_CONJUNCTION =
	"https://github.com/ActuallyHappening/COMP1100/blob/master/code/website/src/apis/prereq.md#did-not-expect-a-logical-conjunction";

export const prereqAPI = (prereq: Prereq) => {
	return new PrereqAPI(prereq);
};

export class PrereqAPI {
	prereq: Prereq;

	constructor(prereq: Prereq) {
		this.prereq = prereq;
	}

	getPrereq(): Prereq {
		if (!this.prereq) {
			throw new TypeError();
		}
		return this.prereq;
	}
	render(options?: { course_cb?: (id: string) => string }): string {
		const settings = {
			course_cb: (id: string) => id.toUpperCase(),
			...options,
		};

		this.check();

		const ret = [];
		for (const idiom of this.getPrereq()) {
			ret.push(this.renderIdiom(idiom, settings));
		}
		return ret.join(" ");
	}
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
			throw TypeError(`Unrecognised idiom: ${JSON.stringify(idiom)}`);
		}
		return ret;
	}
	check(options?: { prereq?: Prereq }): PrereqAPI {
		const settings = {
			prereq: undefined,
			...options,
		};
		const prereq = settings.prereq || this.getPrereq();

		let expectingLogicalConjunction = false;
		for (const idiom of prereq) {
			if (isLogicalConjunction(idiom) && !expectingLogicalConjunction) {
				throw new Error(
					`Didn't expect a logical conjunction but got "${idiom}" anyway, in prereq: ${prereq}\n${DIDNT_EXPECT_LOGICAL_CONJUNCTION}`,
				);
			}
			expectingLogicalConjunction = !expectingLogicalConjunction;
		}

		return this;
	}
	reduce(): PrereqAPI {
		const ret = [...this.getPrereq()];
		this.getPrereq().forEach((idiom, i) => {
			ret[i] = this.reduceIdiom(idiom);
		});
		return new PrereqAPI(ret);
	}
	reduceIdiom(idiom: Idiom): Idiom {
		if (_.isArray(idiom)) {
			if (idiom.length === 1) {
				return this.reduceIdiom(idiom[0]);
			} else {
				return this.reduceIdiom(idiom);
			}
		} else {
			return idiom;
		}
	}
	fillInPrereqs(options: {}) {}
}
