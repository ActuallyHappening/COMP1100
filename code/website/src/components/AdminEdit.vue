<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { inject, onMounted, ref, reactive } from "vue";
import { RecordId, Surreal, Table } from "surrealdb";

const { programs, courses } = inject("state");

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
		});
});

const addCourseState = reactive({
	code: undefined,
	cp: 2,
	name: undefined,
	sem_1: true,
	sem_2: true,
	sem_summer: false,
});
function addCourse() {}
</script>

<template>
	<h2>Add a course</h2>
	<form @submit.prevent="addCourse">
		<label for="addCourse-code"> Course Code ABCD1234 </label>
		<input
			type="text"
			id="addCourse-code"
			v-model="addCourseState.code"
			placeholder="MATH1051"
		/>

		<label for="addCourse-name">Course name</label>
		<input
			type="text"
			id="addCourse-name"
			v-model="addCourseState.name"
			placeholder="Advanced Discrete Math"
		/>
	</form>

	<button @click="storedPassword = ``">
		Reset the db password if you typed the wrong password
	</button>
</template>
