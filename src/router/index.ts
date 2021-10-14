import { createRouter, createWebHistory,createWebHashHistory, RouteRecordRaw } from 'vue-router'
import constantRoute from './constantRoute';

const routes: Array<RouteRecordRaw> = [...constantRoute]

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
