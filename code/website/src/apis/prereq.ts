import { RecordId } from "surrealdb";
import _ from "lodash";
import { assert_course_id, courseAPI } from "./db/course";

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
		if (!_.isArray(this.prereq)) {
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

		let history = undefined as undefined | "OR expected" | "AND expected";
		let expectingLogicalConjunction = false as
			| false
			| "either OR or AND, unknown at this point"
			| "OR expected"
			| "AND expected";
		for (const idiom of prereq) {
			if (isLogicalConjunction(idiom)) {
				if (!expectingLogicalConjunction) {
					throw new Error(
						`Didn't expect a logical conjunction but got "${idiom}" anyway, in prereq: ${prereq}\n${DIDNT_EXPECT_LOGICAL_CONJUNCTION}`,
					);
				}
				if (idiom === "OR") {
					if (history === "AND expected") {
						throw new Error(
							`Expected "OR" but got "AND" as logical conjunction, in prereq: ${prereq}\n${DIDNT_EXPECT_LOGICAL_CONJUNCTION}`,
						);
					} else {
						history = "OR expected";
						expectingLogicalConjunction = false;
					}
				}
				if (idiom === "AND") {
					if (history === "OR expected") {
						throw new Error(
							`Expected "AND" but got "OR" as logical conjunction, in prereq: ${prereq}\n${DIDNT_EXPECT_LOGICAL_CONJUNCTION}`,
						);
					} else {
						history = "AND expected";
						expectingLogicalConjunction = false;
					}
				}
			} else {
				expectingLogicalConjunction =
					history ?? "either OR or AND, unknown at this point";
			}
		}

		return this;
	}

	/** Keeps references, not deep clone */
	reduce(options?: { prereq?: Prereq }): PrereqAPI {
		const settings = {
			prereq: undefined,
			...options,
		};
		const prereq = settings.prereq ?? this.getPrereq();
		const ret = [...prereq];
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

	/**
	 * Replaces all known courses.
	 * Checks and reduces before and after
	 */
	fillKnownCourses(
		withCourses: RecordId<string>[],
		options?: {
			prereq?: Prereq;
		},
	): PrereqAPI | true {
		withCourses.forEach((id) => assert_course_id(id));
		const settings = {
			prereq: undefined,
			...options,
		};
		let prereq = settings.prereq || this.getPrereq();
		// normalize
		this.check({ prereq });
		prereq = this.reduce({ prereq }).getPrereq();

		const courses = new Set(
			...withCourses.map((course) => courseAPI.codeFrom(course)),
		);

		const filledPrereq: (true | Idiom)[] = prereq.map((idiom) => {
			if (_.isArray(idiom)) {
				// start recursively working at the leaves first
				const idiomResult = this.fillKnownCourses(withCourses, {
					...settings,
					prereq: idiom,
				});
				if (idiomResult === true) {
					return true;
				} else {
					return idiomResult.getPrereq();
				}
			} else if (
				idiom instanceof RecordId &&
				courses.has(courseAPI.codeFrom(idiom))
			) {
				// fill in courses given
				return true;
			} else {
				return idiom;
			}
		});

		// a one length must be trivially resolvable
		if (filledPrereq.length === 1) {
			if (filledPrereq[0] === true) {
				// [true] -> true
				return true;
			} else {
				// [course:notdone] -> [course:notdone]
				return new PrereqAPI(filledPrereq as Idiom[]);
			}
		} else if (filledPrereq.some((idiom) => idiom === true)) {
			// at least one course can be filled
			// and since the length is one, this is either an OR or AND chain
			if (filledPrereq[1] === "OR") {
				// OR chain
				// since we know one of these must be true, the whole prereqs must be passed
				return true;
			} else if (filledPrereq[1] === "AND") {
				// AND chain, more complicated
				// ignoring the logical conjunctions, we can remove all idioms that
				// aren't a course already filled, then check length cases
				const non_logical_idioms = filledPrereq.filter(
					(idiom) => idiom !== "AND" && idiom !== "OR",
				);
				const removed_filled_courses = non_logical_idioms.filter((idiom) => {
					// remove all `true`s
					if (idiom === true) return false;
					return true;
				});
				console.log(`REMOVED FILLED`, removed_filled_courses);
				const remaining_idioms = removed_filled_courses;
				if (remaining_idioms.length === 0) {
					// case where all courses were filled with no junk
					// withCourses: [course:123, course:abc]
					// prereq: [course:123, "AND", course:abc]
					return true;
				} else {
					// some leftover
					// withCourses: [course:123]
					// prereq: [course:123, "AND", course:abc]
					non_logical_idioms
						.reduce<Prereq>((acc, val) => {
							return acc.concat("AND", val);
						}, [] as Prereq)
						.slice(1);
				}
			}
		} else {
			// no courses or simplifications in this layer, give back to parent as is
			return new PrereqAPI(filledPrereq as Prereq);
		}
	}
}
