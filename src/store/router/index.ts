import {_cloneDeep,_filter}  from '@/utils/lodash';
import handleRoutes from '@/utils/handleRoutes';
import router from '@/router';
import useGlobalFunction from '@/utils/useGlobalFunction';
const {getLocal,setLocal,removeLocal} = useGlobalFunction();
var newRouterList:Array<any>=[];
const permission:any = {
  namespaced: true,
  parentId:getLocal('parentId','session'),
  moduleId:getLocal('moduleId','session'),
  state: {
    routes: [],
    addRouters:'',
    response:[]
  },
  actions: {

  },
  mutations: {
    SETRESPONSE: (state:any, value:any) => {
      state.response = value;
    },
    HANDLEROUTER: (state:any, obj:any) => {
      newRouterList=_cloneDeep(obj.routers);
      state.addRouters = handleRoutes(obj.routers,obj.id,obj.mid)[0];
      router.addRoute({
        path: "",
          name: "plane",
          component: () => import("@/views/module.vue"),
          meta: {
            requireAuth: true,
          },
          children:[state.addRouters]
      });
      if(obj.fullScreen===true) return false;
      if (obj.routers.length == 0) {
        router.replace("/home");
      } else if (
        _filter(newRouterList, (o:any) => o.moduleName == getLocal("moduleName",'session')).length == 0
      ) {
        router.replace("/home");
      } else {
        if (getLocal("moduleNameUrl",'session')) router.replace({
          path:getLocal("moduleNameUrl",'session')
        });
        else router.replace("/home");
      }
    },
  }
}


export default permission
