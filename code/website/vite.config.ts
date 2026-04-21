import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// import { globSync } from "glob";
// const files = globSync("src/apis/**/*.ts");
// console.log(files);

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ["surrealdb"],
  },
  optimizeDeps: {
    include: ["surrealdb"], // force a single pre-bundle entry
  },
  plugins: [vue(), vueDevTools()],
});
