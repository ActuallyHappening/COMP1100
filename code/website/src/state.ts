/**
 * This file manages the network and localStorage state
 */

import { useStorage } from "@vueuse/core";

export const localState = useStorage(`student-info`, {
	current: "plan1",
	plan1: {
		name: "My first plan",
		programId: null,
	},
});

import { Surreal, Table } from "surrealdb";

const db = new Surreal();

// Open a connection and authenticate
let dbPassword;
if (typeof process !== "undefined") {
	// assuming running node directly
	dbPassword = process.env.COMP1100_PASSWORD;
} else {
	// assuming this is running in the browser
	dbPassword = import.meta.env.VITE_COMP1100_PASSWORD;
}
await db.connect(
	"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
	{
		namespace: "comp1100",
		database: "master",
		// auth: {
		// 	username: "im-lazy-user",
		// 	password: dbPassword,
		// },
	},
);

export const programs = await db.select(new Table("program"));
export const courses = await db.select(new Table("course"));

console.log(programs, courses);

// // read file query.surql
// import { readFile } from "fs/promises";

// const query = await readFile("./query.surql", "utf8");

// const resp = await db.query(query);
// console.log(`resp`, resp);

// export const netState = null;
