<template>
  <div class="wrap">
    <nav class="nav">
      <router-link to="/orders">Orders</router-link>
      <router-link to="/sales">Sales</router-link>
      <router-link to="/incomes">Incomes</router-link>
      <router-link to="/stocks">Stocks</router-link>
    </nav>
    <routerView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
.wrap {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}
.nav {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.nav a {
  padding: 6px 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  text-decoration: none;
}
.nav a.router-link-active {
  background: #111;
  color: #fff;
  border-color: #111;
}
</style>
