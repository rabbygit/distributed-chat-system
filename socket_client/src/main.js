import Vue from "vue";
import App from "./App.vue";
import VueRouter from 'vue-router'

import GroupChat from "./components/GroupChat"
import Home from "./components/Home"

Vue.config.productionTip = false;

Vue.use(VueRouter)

const routes = [
  { path: '/', component: Home },
  { path: '/group', component: GroupChat },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes // short for `routes: routes`
})

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
