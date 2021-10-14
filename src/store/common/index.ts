import useGlobalFunction from '@/utils/useGlobalFunction';
const {getLocal,setLocal} = useGlobalFunction();
const common={
  namespaced:true,
  state: {
    mainRoute:'/plane',
    loading:false,
    userInfo: {},
    fileBaseurl:'https://mro.snowlink.cn/file/am-boot/sys/common/show',
    fileBaseurlD: "https://mro.snowlink.cn/file/am-boot/sys/common/download",
    projectList:getLocal('projectList'),
    carousel: true, //大屏轮播状态
    currentProject:getLocal('currentProject','session')?getLocal('currentProject','session'):getLocal('projectList')?getLocal('projectList')[0]:{},
    currentRouterPath:getLocal('currentRouterPath','session')?getLocal('currentRouterPath','session'):'',
    isMany:getLocal('isMany','session')?getLocal('isMany','session'):0,
    multipleProject:[]
  },
  mutations: {
    SETLOADING: (state:any, value:Boolean) => {
      state.loading = value
    },
    SETUSERINFO: (state:any, value:Object) => {
      state.userInfo = value
    },
    SETPROJECTLIST: (state:any, value:Object) => {
      state.projectList = value
    },
    SETCURRENTPROJECT: (state:any, value:Object) => {
      setLocal('currentProject',value,'session');
      state.currentProject = value
    },
    SETMODE:(state:any,value:Number)=>{
      state.mode = value;
    },
    SETMANY:(state:any,value:Number)=>{
      state.isMany = value;
    },
    SETCURRENTPATH:(state:any,value:String)=>{
      state.currentRouterPath = value;
    },
    HANDLECAROUSEL:(state:any,value:String)=>{
      state.carousel = value;
    },
    SETMULTIPLE:(state:any,value:String)=>{
      state.multipleProject = value;
    },
  },
  actions: {
    setLoading({
      commit
    }:any, res:any) {
      commit('SETLOADING', res)
    },
    setUserInfo({
      commit
    }:any, res:any) {
      commit('SETUSERINFO', res)
    },
    setProjectList({
      commit
    }:any, res:any) {
      commit('SETPROJECTLIST', res)
    },
    setCurrentProject({
      commit
    }:any, res:any) {
      commit('SETCURRENTPROJECT', res)
    },
    setMode({
      commit
    }:any, res:any) {
      commit('SETMODE', res)
    },
    setMany({
      commit
    }:any, res:any) {
      commit('SETMANY', res)
    }
  }
};
export default common;
