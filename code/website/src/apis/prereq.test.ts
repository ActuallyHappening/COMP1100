import { RecordId } from "surrealdb";
import { test, expect } from "vitest";
import { prereqAPI, type Prereq } from "./prereq";

function course(num?: number) {
	return new RecordId(
		"course",
		num ?? Math.random().toString(36).substring(2, 15),
	);
}

test("prereqAPI works", () => {
	const examplePass = [course(1), "OR", course(2)] satisfies Prereq;
	expect(prereqAPI(examplePass).renderPrereq()).to.be.eq("1 or 2");
});
