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
await db.connect(
	"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
	{
		namespace: "comp1100",
		database: "master",
		auth: {
			username: "comp1100-team10",
			password: process.env.COMP1100_PASSWORD,
		},
	},
);

// read file query.surql
import { readFile } from "fs/promises";

const query = await readFile("./query.surql", "utf8");

const resp = await db.query(query);
console.log(`resp`, resp);

export const netState = null;
