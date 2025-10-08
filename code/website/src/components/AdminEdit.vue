<script lang="ts" setup>
import { useStorage } from "@vueuse/core";
import { inject, onMounted, ref } from "vue";
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

const addCourse = computed({
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
		<label for="addCourse-code">
		<input type="text" id="addCourse-code" v-model="addCourse.code" />
	</form>
</template>
