import { Surreal, Table, RecordId } from "surrealdb";
import { programs } from "./db/program";
import { courses } from "./db/course";
import { program_requirements } from "./db/program_requirement";
import _ from "lodash";

export const assert_id = (id1: RecordId<string> | unknown, msg?: string) => {
	if (!(id1 instanceof RecordId)) {
		throw new TypeError(
			`Not an id (${JSON.stringify(id1)})` + msg ? `: ${msg}` : ``,
		);
	}
};
export const id_eq = (id1: RecordId<string>, id2: RecordId<string>) => {
	assert_id(id1);
	assert_id(id2);
	return id1.id.toString() === id2.id.toString() && id1.tb === id2.tb;
};

export function refresh() {
	const db = new Surreal();
	return Promise.resolve()
		.then(() => {
			return db.connect(
				"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
				{
					namespace: "comp1100",
					database: "master",
					// guest auth
				},
			);
		})
		.then(() =>
			Promise.all([
				db
					.select(new Table("program"))
					.then((data) => (programs.value = data as any)),
				db
					.select(new Table("course"))
					.then((data) => (courses.value = data as any)),
				db
					.select(new Table("program_requirement"))
					.then((data) => (program_requirements.value = data as any)),
			]),
		)
		.catch((err) => {
			const error = new Error(`Failed to load data from the database`, {
				cause: err,
			});
			console.error(error);
			toast(error.message, { type: "error" });
		})
		.then(() => {
			console.info(`Successfully loaded all information from the db:`);
			console.info(`programs`, _.cloneDeep(programs.value));
			console.info(`courses`, _.cloneDeep(courses.value));
			console.info(
				`program_requirement`,
				_.cloneDeep(program_requirements.value),
			);
		});
}
