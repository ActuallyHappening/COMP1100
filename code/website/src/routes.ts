import StudentNumberForm from "./components/StudentNumberForm.vue";
import ProgramForm from "./components/ProgramForm.vue";

import {
	createMemoryHistory,
	createWebHistory,
	createRouter,
} from "vue-router";

const routes = [
	{ path: `/`, component: StudentNumberForm },
	{ path: `/onboarding`, component: StudentNumberForm },
	{ path: `/onboarding/student-number`, component: StudentNumberForm },
	{ path: `/onboarding/program`, component: ProgramForm },
];

export const router = createRouter({
	// history: createMemoryHistory(),
	history: createWebHistory(),
	routes,
});

// import HomeView from "./HomeView.vue";
// import AboutView from "./AboutView.vue";
