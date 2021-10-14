import {
  fetch
} from '@/utils/promise';

// 获取字典 T7是实例点类型
export function getDict(type:string) {
  return fetch({
    url: "/configend/dict/" + type,
    method: "get"
  });
}
// 获取冷间名称
export function queryRooms(data:object) {
  return fetch({
    url: `/phmapi/singleProjectMonitor/queryRooms`,
    method: "post",
    data
  });
}

// 冷间对应参数图标
export function queryRoomMonitor(data:object) {
  return fetch({
    url: `/phmapi/singleProjectMonitor/queryRoomMonitor`,
    method: "post",
    data,
    status: false
  });
}


// 查询重要通知分页
export function queryNoticeByPro(data:any) {
  return fetch({
    url: `/mro/notice/queryNoticeByPro`,
    method: "post",
    data
  });
}

export function queryMonitorGroupDatas(data:any) {
  return fetch({
    url: `/phmapi/projectMonitor/queryMonitorGroupDatas`,
    method: "post",
    data,
    status: false
  });
}

//获取测点数据
export function trendAnalysis(data:any) {
  return fetch({
    url: `/phmapi/statistic/trendAnalysis`,
    method: "post",
    data
  });
}

/*
 ***远程控制
 */
// 全部参数
export function getProjectTreeByProUuid(id:string|number) {
  return fetch({
    url: `/configend/project/getProjectTreeByProUuid?proUuid=${id}`,
    method: "get"
  });
}

// 点的列表
export function querySetPoints(data:any) {
  return fetch({
    url: `/phmapi/projectMonitor/querySetPoints`,
    method: "post",
    data
  });
}
// 修改变量值
export function writeVariable(data:any) {
  return fetch({
    url: `/phmapi/projectMonitor/writeVariable`,
    method: "post",
    data
  });
}

// 查询所有参数
export function allPoint(data:any) {
  return fetch({
    url: "/configend/pubstandaPropIns/search?page=" +
      data.queryInfo.page +
      "&size=" +
      data.queryInfo.size,
    method: "post",
    data,
    status: false
  });
}
