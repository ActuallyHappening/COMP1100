import StudentNumberForm from "./components/StudentNumberForm.vue";

import {
	createMemoryHistory,
	createWebHistory,
	createRouter,
} from "vue-router";

const routes = [
	{ path: "/", component: StudentNumberForm },
	{ path: "/about", component: StudentNumberForm },
];

export const router = createRouter({
	// history: createMemoryHistory(),
	history: createWebHistory(),
	routes,
});

// import HomeView from "./HomeView.vue";
// import AboutView from "./AboutView.vue";
