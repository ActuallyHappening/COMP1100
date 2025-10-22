import { createApp } from "vue";
import { router } from "./routes";
import "./style.css";
import App from "./App.vue";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";

import "vue3-toastify/dist/index.css";

const app = createApp(App);
app.use(router);
app.use(Vue3Toastify, {
	autoClose: 3000,
	// ...
} as ToastContainerOptions);
app.mount("#app");
