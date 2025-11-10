import { RecordId } from "surrealdb";
import { test, expect } from "vitest";
import {
	prereqAPI,
	type Prereq,
	DIDNT_EXPECT_LOGICAL_CONJUNCTION,
} from "./prereq";

function course(num?: number) {
	return new RecordId(
		"course",
		num ?? Math.random().toString(36).substring(2, 15),
	);
}

test("prereqAPI works", () => {
	const examplePass = [course(1), "OR", course(2)] satisfies Prereq;
	expect(prereqAPI(examplePass).render()).to.be.eq("1 or 2");
});

test("prereqAPI fails with good err", () => {
	const failing = [[course(1), course(2)], ["OR"]] satisfies Prereq[];
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
