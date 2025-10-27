import type { RecordId } from "surrealdb";
import { assert_id, id_eq } from "../db";
import { ref } from "vue";
import { toast } from "vue3-toastify";

export const program_requirements = ref(null as ProgramRequirement[] | null);

export const requirementTypes = [
	"core",
	"major",
	"major-subcomponent",
	"nomaj",
	"nomaj-subcomponent",
	"extmaj",
	"extmaj-subcomponent",
	"breadth",
	"gen-elec",
] as const;
export type RequirementType = (typeof requirementTypes)[number];
export const requirement_type_to_header = (
	requirement: RequirementType,
): string => {
	if (requirement === "core") {
		return "Core";
	} else if (requirement === "major") {
		return "Major";
	} else if (requirement === "nomaj") {
		return "No Major";
	} else if (requirement === "extmaj") {
		return "Extended Major";
	} else if (requirement === "breadth") {
		return "Breadth";
	} else if (requirement === "gen-elec") {
		return "General Elective";
	} else {
		// Shouldn't hit currently
		return requirement.toUpperCase();
	}
};
export const requirement_types_to_header = (
	requirements: RequirementType[],
): string => {
	return [...new Set(requirements)]
		.map((req) => requirement_type_to_header(req))
		.join(" | ");
};
export type ProgramRequirement = {
	id: RecordId<string>;
	name: string;
	type: RequirementType;
	short_name: string | undefined;
	required_cp: number | undefined;
	sub_requirements: RecordId<string>[] | undefined;
	course_options: RecordId<string>[][] | undefined;
};

export const programRequirementAPI = {
	getAll(): ProgramRequirement[] | null {
		const ret = program_requirements.value;
		if (!ret) {
			toast(`Program requirements not loaded yet`, { type: "info" });
		}
		return ret;
	},
	get(id: RecordId<string>): ProgramRequirement | undefined {
		assert_id(id);
		const all = this.getAll();
		if (!all) {
			return;
		}
		const ret = all.find((req) => id_eq(req.id, id));
		if (!ret) {
			toast(`Couldn't find program_requirement ${id}`, { type: "error" });
		}
		return ret;
	},
	getOrError(id: RecordId<string>): ProgramRequirement {
		const ret = this.get(id);
		if (!ret) {
			throw new Error(`Couldn't find program_requirement ${id}`);
		}
		return ret;
	},
};
