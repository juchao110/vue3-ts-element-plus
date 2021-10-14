const constantRoute=[
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/module.vue"),
    children: [{
        path: "",
        redirect: "/login/loginin"
      },
      {
        path: "loginin",
        name: "loginin",
        component: () => import("@/views/login/login.vue")
      },
      // {
      //   path: "register",
      //   name: "register",
      //   component: () => import("@/pages/login/register")
      // },
      // {
      //   path: "forget",
      //   name: "forget",
      //   component: () => import("@/pages/login/forget")
      // }
    ]
  },
  {
    path:'/fullScreen',
    name:'fullScreen',
    component:()=>import("@/views/intelligentMonitor/cabin/screen/module.vue"),
    meta: {
      requireAuth: true //需要登录才能访问
    },
    children:[
      {
        path:'cabinScreen',
        name:'cabinScreen',
        component:()=>import("@/views/intelligentMonitor/cabin/screen/index.vue")
      },
    ]
  },

  {
    path: "",
    redirect: "/home"
  },
  {
    path:'/home',
    name:'home',
    component: () => import("@/views/home.vue"),
    meta: {
      requireAuth: true,
    },
  },

]
export default constantRoute;
