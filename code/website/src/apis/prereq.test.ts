import { RecordId } from "surrealdb";
import { test, expect } from "vitest";
import {
	prereqAPI,
	type Prereq,
	DIDNT_EXPECT_LOGICAL_CONJUNCTION,
	PrereqAPI,
} from "./prereq";

function course(num?: number) {
	return new RecordId(
		"course",
		String(num ?? Math.random().toString(36).substring(2, 15)),
	);
}

test("prereqAPI render works", () => {
	const examplePass = [course(1), "OR", course(2)] satisfies Prereq;
	expect(prereqAPI(examplePass).render()).to.be.eq("1 or 2");
});

test("prereqAPI render fails with good err", () => {
	const failing = [
		[course(1), course(2)],
		["OR"],
		[course(1), "OR", course(2), "AND", course(3)],
		[[[course(1), course(2)]]],
	] satisfies Prereq[];
	for (const failingExample of failing) {
		// checks that the error message contains the correct needle
		let threw = false;
		try {
			prereqAPI(failingExample).render();
		} catch (err) {
			err = err as Error;
			threw = true;
			expect(err).to.be.instanceOf(Error);
			expect((err as Error).message).to.contain(
				DIDNT_EXPECT_LOGICAL_CONJUNCTION,
			);
		}
		expect(threw);
	}
});

test("prereqAPI clean works", () => {
	const prereq = [
		course(1),
		"OR",
		[course(2)],
		"OR",
		[[[course(6)]]],
	] satisfies Prereq;
	expect(prereqAPI(prereq).reduce().render()).to.be.eq("1 or 2 or 6");
});

test("PrereqAPI fillKnownCourses works", () => {
	const unsuccessExamples = [
		{
			knownCourses: [],
			prereq: [course(1)],
			rendered: "1",
		},
	] satisfies {
		knownCourses: RecordId<string>[];
		prereq: Prereq;
		rendered: string;
	}[];
	for (const example of unsuccessExamples) {
		const res = prereqAPI(example.prereq).fillKnownCourses(
			example.knownCourses,
		);
		expect(res).to.not.eq(true);
		const rendered = (res as PrereqAPI).render();
		expect(rendered).to.eq(example.rendered);
	}

	const successExamples = [
		{
			knownCourses: [course(1)],
			prereq: [course(1)],
		},
		{
			knownCourses: [course(1)],
			prereq: [course(1), "OR", course(69)],
		},
		{
			knownCourses: [course(1)],
			prereq: [course(69), "OR", course(1)],
		},
		{
			knownCourses: [course(1), course(2)],
			prereq: [course(1), "AND", course(2)],
		},
	] satisfies { knownCourses: RecordId<string>[]; prereq: Prereq }[];
	for (const example of successExamples) {
		const res = prereqAPI(example.prereq).fillKnownCourses(
			example.knownCourses,
		);
		expect(res).to.eq(true);
	}
});
