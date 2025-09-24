/**
 * This file manages the network and localStorage state
 */

import { useStorage } from "@vueuse/core";

export const localState = useStorage(`student-info`, {
	studentNumber: null,
	programCode: null,
	plans: null,
});

export const oldState = useStorage(`old-student-info`, {
	studentNumber: null,
	programCode: null,
	plan: null,
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

import query from "../query.surql?raw";
console.log(query);

// // read file query.surql
// import { readFile } from "fs/promises";

// const query = await readFile("./query.surql", "utf8");

// const resp = await db.query(query);
// console.log(`resp`, resp);

// export const netState = null;
