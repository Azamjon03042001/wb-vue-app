import { createRouter, createWebHistory } from "vue-router";

const Incomes = () => import("../pages/IncomesPage.vue");
const Orders = () => import("../pages/OrdersPage.vue");
const Sales = () => import("../pages/SalesPage.vue");
const Stocks = () => import("../pages/StocksPage.vue");

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/orders" },
    { path: "/incomes", component: Incomes },
    { path: "/orders", component: Orders },
    { path: "/sales", component: Sales },
    { path: "/stocks", component: Stocks },
  ],
});
