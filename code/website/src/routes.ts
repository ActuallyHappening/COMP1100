import { watch } from "vue";
import Home from "./components/Home.vue";

import {
	createMemoryHistory,
	createWebHistory,
	createRouter,
} from "vue-router";
import { selectedState } from "./apis/state";
import { courseAPI } from "./apis/db/course";
import { RecordId } from "surrealdb";
import { filters } from "./apis/filter";
import _ from "lodash";
import { planAPI } from "./apis/plan";

const routes = [
	{ path: `/`, component: Home },
	{ path: `/home`, component: Home },
	{ path: `/plan/:id`, name: "plan", component: Home },
	{ path: `/index.html`, component: Home },
];

export const router = createRouter({
	// history: createMemoryHistory(),
	history: createWebHistory(),
	routes,
});

/** Doesn't really change any behaviour yet */
watch(
	() => planAPI.getCurrent().name,
	(current) => {
		if (typeof current === "string" && current !== "") {
			router.push({ name: `plan`, params: { id: current } });
		}
	},
	{ deep: true, immediate: true },
);
// hash <-> selectedState
watch(
	() => router.currentRoute.value.hash,
	(current) => {
		const hash = current.split("#")[1];
		if (hash === selectedState.value) {
			// avoids infinite watch loop
			return;
		}
		if (typeof hash !== "string" && hash === "") {
			return;
		}
		if (!courseAPI.get(new RecordId("course", hash))) {
			return;
		}
		selectedState.value = hash;
	},
	{ deep: true, immediate: true },
);
watch(selectedState, (current) => {
	const hash = router.currentRoute.value.hash.split("#")[1];
	if (hash === current) {
		return;
	}
	if (!current) {
		return;
	}
	router.push({ hash: `#${current}` });
	// router.currentRoute.value.hash = current;
});
watch(
	() => filters.value,
	(current) => {
		router.push({ query: _.cloneDeep(filters.value) });
	},
	{ deep: true, immediate: true },
);
