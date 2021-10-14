import useGlobalFunction from '@/utils/useGlobalFunction';
const {getLocal} = useGlobalFunction();
import {_cloneDeep,_filter} from '@/utils/lodash';
const bread = {
  namespaced: true,
  state: {
    list: getLocal('phmNavList','session')?[...getLocal('phmNavList','session')]:[],
    currentNav: {
      name: ''
    }
  },
  getters: {
    getNavList: (state:any) => {
      return state.list
    }
  },
  mutations: {
    setNavList: (state:any, value:any) => {
      if (value === null) return false;
      else {
        if(state.list.length==0) return state.list.push(value);
        if(_filter(state.list,(o:any)=>o.name==value.name).length==0) state.list.push(value);
      }
    },
    setCurrentNav: (state:any, value:any) => {
      state.currentNav = value;

    },
    removeCurrentNav: (state:any, value:any) => {
      const position = state.list.map((e:any) => e.name).indexOf(value)
      state.list.splice(position, 1);
    },
    clearNavList: (state:any, value:any) => {
      state.list = value;
    }
  },
  actions: {
    setNavListAction({
      commit
    }:any, res:any) {
      commit("setNavList", res);
    },
    setCurrentNavAction({
      commit
    }:any, res:any) {
      commit("setCurrentNav", res);
    },
    removeCurrentNavAction({
      commit
    }:any, res:any) {
      commit("removeCurrentNav", res);
    },
    clearNavListAction({
      commit
    }:any, res:any) {
      commit("clearNavList", res);
    }
  }
}
export default bread;
