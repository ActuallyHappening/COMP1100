import Home from "./components/Home.vue";
import AdminEdit from "./components/AdminEdit.vue";
import CoursesList from "./components/CoursesList.vue";

import {
	createMemoryHistory,
	createWebHistory,
	createRouter,
} from "vue-router";

const routes = [
	{ path: `/`, component: Home },
	{ path: `/edit`, component: AdminEdit },
	{ path: `/courses`, component: CoursesList },
	// { path: `/onboarding`, component: StudentNumberForm },
	// { path: `/onboarding/student-number`, component: StudentNumberForm },
	// { path: `/onboarding/program`, component: ProgramForm },
];

export const router = createRouter({
	// history: createMemoryHistory(),
	history: createWebHistory(),
	routes,
});

// import HomeView from "./HomeView.vue";
// import AboutView from "./AboutView.vue";
