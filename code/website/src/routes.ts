import { watch } from "vue";
import Home from "./components/Home.vue";

import {
	createMemoryHistory,
	createWebHistory,
	createRouter,
} from "vue-router";

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

// import HomeView from "./HomeView.vue";
// import AboutView from "./AboutView.vue";

/** Doesn't really change any behaviour yet */
watch(
	() => getCurrentPlanState().name,
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
		if (!fullyLoaded() || !getCourse(hash, { allowUnknown: true })) {
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
