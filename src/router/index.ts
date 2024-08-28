import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

import HomePage from "../views/HomePage.vue";
import DocumentScanner from "../views/DocumentScanner.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage
  },
  {
    path: "/scanner",
    name: "Scanner",
    component: DocumentScanner
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
