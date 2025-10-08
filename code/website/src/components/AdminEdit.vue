<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { inject, onMounted, ref, reactive } from "vue";
import { RecordId, Surreal, Table } from "surrealdb";

import CoursesList from "./CoursesList.vue";
import Course from "./Course.vue";

const { programs, courses, refresh: refreshState } = inject("state");

const storedPassword = useStorage(`db-password`, ``);
const adminDb = ref(undefined as undefined | Surreal);

onMounted(() => {
	if (!storedPassword.value) {
		storedPassword.value = prompt("DB password");
	}
	const db = new Surreal();
	return Promise.resolve()
		.then(() => {
			// Open a connection and authenticate
			return db.connect(
				"wss://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud",
				{
					namespace: "comp1100",
					database: "master",
					auth: {
						namespace: "comp1100",
						database: "master",
						username: "team",
						password: storedPassword.value,
					},
				},
			);
		})
		.then(() => {
			adminDb.value = db;
		})
		.catch((err) => {
			const error = new Error(`Failed to load data from the database`, {
				cause: err,
			});
			console.error(error);
			messageError(error.message);
		});
});

const message = reactive({} as {} | { success: string } | { error: string });
function clearMessage() {
	message.success = undefined;
	message.error = undefined;
}
function messageSuccess(msg: string) {
	clearMessage();
	message.success = msg;
}
function messageError(err: string) {
	clearMessage();
	message.error = err;
}

const addCourseState = reactive({
	code: undefined,
	cp: 2,
	name: undefined,
	sem_1: true,
	sem_2: true,
	sem_summer: false,
	/** Uses map structure not array */
	prerequisites: {},
});
function addCourse() {
	const prerequisites = Object.keys(addCourseState.prerequisites)
		.filter((code) => addCourseState.prerequisites[code])
		.map((code) => new RecordId("course", code.toLowerCase()));

	const newCourse = {
		code: addCourseState.code.toUpperCase(),
		cp: addCourseState.cp,
		name: addCourseState.name,
		sem_1: addCourseState.sem_1,
		sem_2: addCourseState.sem_2,
		sem_summer: addCourseState.sem_summer,
		prerequisites,
		id: new RecordId("course", addCourseState.code.toLowerCase()),
	};
	return Promise.resolve()
		.then(() => {
			console.info(`Inserting`, structuredClone(newCourse));
		})
		.then(() => {
			return adminDb.value.insert("course", newCourse);
		})
		.then(() => {
			messageSuccess("Added course");
			refreshState();
		})
		.catch((err) => {
			const error = new Error(`Failed to add course`, { cause: err });
			console.error(error);
			messageError(error.message);
		});
}
</script>

<template>
	<p class="text-danger" v-show="message.error">{{ message.error }}</p>
	<p class="text-success" v-show="message.success">{{ message.success }}</p>
	<h2>Add a course</h2>
	<form @submit.prevent="addCourse">
		<label for="addCourse-code"> Course Code ABCD1234 </label>
		<input
			type="text"
			id="addCourse-code"
			v-model="addCourseState.code"
			placeholder="MATH1051"
			required
		/>

		<label for="addCourse-name">Course name</label>
		<input
			type="text"
			id="addCourse-name"
			v-model="addCourseState.name"
			placeholder="Advanced Discrete Math"
			required
		/>

		<label for="addCourse-sem1">Semester 1?</label>
		<input
			type="checkbox"
			id="addCourse-sem1"
			v-model="addCourseState.sem_1"
		/>
		<label for="addCourse-sem2">Semester 2?</label>
		<input
			type="checkbox"
			id="addCourse-sem2"
			v-model="addCourseState.sem_2"
		/>

		<label for="addCourse-sem-summer">Summer Semester?</label>
		<input
			type="checkbox"
			id="addCourse-sem-summer"
			v-model="addCourseState.sem_summer"
		/>

		<label for="addCourse-cp">Credit Points:</label>
		<input
			type="number"
			min="1"
			max="4"
			id="addCourse-cp"
			v-model="addCourseState.cp"
		/>

		<fieldset>
			<legend>What courses are pre-requisites for this course?</legend>
			<ul>
				<li v-for="course in courses" :key="course.code">
					<input
						type="checkbox"
						v-model="addCourseState.prerequisites[course.code]"
					/>
					<Course :code="course.code" />
				</li>
			</ul>
		</fieldset>

		<button type="submit" class="btn btn-success">Add course</button>
	</form>

	<!-- <h2>Existing courses:</h2>
	<CoursesList /> -->

	<button @click="storedPassword = ``">
		Reset the db password if you typed the wrong password
	</button>
</template>
