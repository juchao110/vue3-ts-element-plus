import {_compact,_sortBy,_filter}  from '@/utils/lodash';
function filterAsyncRouter(routers:Array<any>,pid:Number,mid:Number) {
  if (routers.length == 0) return routers;
  let accessedRouters = _compact(
    routers.map(e => {
      e.name = e.moduleName;
      if(typeof(e.component)==='string') e.component = loadView(e.component);
      if (!e.meta.icon) e.meta.icon = "monitor";
      if (e.parentId == pid) {
        e.children = doTree(routers, e.moduleId);
        return e;
      }
    })
  );
  return _filter(accessedRouters,(e:any)=>e.moduleId==mid);
}

function loadView(view:String) {
  return () => import(`@/views${view}`);
}

function doTree(data:Array<any>, id:String|Number) {
  if (data.length < 1) return []
  const parent = checkChild(data, id)
  return parent
};

function checkChild(data:Array<any>, pid:String|Number) {
  let arr:Array<any> = [];
  data.forEach((e:any, index:Number) => {
    if (e.parentId == pid) {
      e.children = checkChild(data, e.moduleId);
      arr.push(e);
    }
  })
  return _sortBy(arr, 'sortNo');
};

export default function handleRoutes(list:Array<any>,pid:Number,mid:Number) {
    return filterAsyncRouter(list,pid,mid)
}
