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
