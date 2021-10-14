import store from '@/store';
import getToken from './getToken';
import router from "@/router";
import {
  ElMessage,
} from 'element-plus';
import {_cloneDeep,_filter} from '@/utils/lodash';
import {
	queryUserAccessModules,
	queryProject,
  canAccessModule
} from '@/api/login';
import useGlobalFunction from '@/utils/useGlobalFunction';
const {getLocal,setLocal,removeLocal} = useGlobalFunction();
const state:any = store.state;
queryUserAccessModules({}).then((module:any)=>{
  store.commit('permission/SETRESPONSE', _cloneDeep(module.data.data));
  if(getLocal('parentId','session')) store.commit('permission/HANDLEROUTER', {
    routers:_cloneDeep(module.data.data),
    id:Number(getLocal('parentId','session')),
    mid:Number(getLocal('moduleId','session')),
    fullScreen:window.location.hash.indexOf('fullScreen')>-1
  });
  else if(window.location.hash.indexOf('fullScreen')<0) router.replace({
    path:'/home'
  })
})
router.beforeEach((to:any,from:any,next:any)=>{
  if(to.path.indexOf('home')>-1){
    removeLocal('parentId','session');
    removeLocal('moduleId','session');
    removeLocal('currentRouterPath','session');
    removeLocal('phmNavList','session');
    removeLocal("moduleNameUrl","session");
    removeLocal("moduleName","session");
    removeLocal("moduleTitle","session");
    removeLocal("isMany","session");
    store.commit('bread/clearNavList',[])
  }
  if(to.matched.some((res:any) => res.meta.requireAuth)){// 必须登录才能访问;
    if(getToken()){
      if(to.path.indexOf('fullScreen')>-1) next();
      else if(to.path.indexOf('home')>-1) next();
      else{
          store.dispatch('bread/setNavListAction', to)
          setTimeout(() => {
            store.dispatch('bread/setCurrentNavAction', to)
          }, 100)
          next()
      }
    }else{
      next({
        name:'loginin'
      })
    }
  }else next();
})
