import { RecordId } from "surrealdb";

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
