import { Surreal, Table, RecordId } from "surrealdb";
import { programs, REMOVEME } from "./db/program";
import { courses } from "./db/course";
import { adv_courses } from "./db/adv_courses";
import { program_requirements } from "./db/program_requirement";
import _ from "lodash";
import { toast } from "vue3-toastify";

export const assert_id = (id1: RecordId<string> | unknown, msg?: string) => {
  msg = msg ? " " + msg : "";
  if (!(id1 instanceof RecordId)) {
    throw new TypeError(`Not an id (${JSON.stringify(id1)})` + msg);
  }
  if (!(typeof id1.id === "string")) {
    throw new TypeError(`Not a string id (${JSON.stringify(id1)})` + msg);
  }
};
export const id_eq = (id1: RecordId<string, string>, id2: RecordId<string, string>) => {
  assert_id(id1);
  assert_id(id2);
  return id1.id.toString() === id2.id.toString() && id1.tb === id2.tb;
};

export function refresh() {
  const db = new Surreal();
  return Promise.resolve()
    .then(() => {
      return db.connect(
        // "wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
        "wss://creative-swallo-06egut78q5ostc88hn8182m37o.aws-usw2.surreal.cloud/",
        {
          namespace: "comp1100",
          database: "master",
          // database auth
          authentication: {
            namespace: "comp1100",
            database: "master",
            username: "viewer",
            password: "e670af83-7e30-422d-8b9f-7e8c22803e3b",
          },
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
        db
          .select(new Table("adv_courses"))
          .then((data) => (adv_courses.value = data as any)),
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
      console.info(`adv_courses`, _.cloneDeep(adv_courses.value), adv_courses.value);

      REMOVEME(RecordId);

      for (const program of programs.value) {
        console.log('program:', program, program.id, program.id instanceof RecordId);
        // console.log('program stuff', program.id.toString(), program.id.toJSON())
        // console.log('program stuff', program.id.id)
      }
      db
        .select(new Table("program"))
        .then((data) => {
          for (const program of data) {
            console.log('2program:', program, program.id, program.id instanceof RecordId);
            console.log('2program stuff', program.id.toString(), program.id.toJSON())
            console.log('2program stuff', program.id.id)
          }
        })
    });
}
