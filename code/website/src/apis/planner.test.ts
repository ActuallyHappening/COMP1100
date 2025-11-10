import { test, expect } from "vitest";
import { defaultPlanner, plannerAPI } from "./planner";
import { RecordId } from "surrealdb";

function course(num?: number) {
	return new RecordId(
		"course",
		String(num ?? Math.random().toString(36).substring(2, 15)),
	);
}

test("plannerAPI getAllCourses works", () => {
	const planner = plannerAPI(defaultPlanner());

	planner.assignNewCourse(["2025 Sem 1", 0], course(1));
	planner.assignNewCourse(["2025 Sem 1", 1], course(2));
	planner.assignNewCourse(["2025 Sem 2", 2], course(3));

	const allCourses = planner.getAllCourses();
	expect(allCourses).to.deep.eq([course(1), course(2), course(3)]);
});
