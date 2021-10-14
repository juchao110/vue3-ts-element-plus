import {
  fetch
} from '@/utils/promise';


//冷库24小时故障报警
export function query24HourProjectAlarm(data:object) {
  return fetch({
    url: `/phmapi/projectAlarmMonitor/query24HourProjectAlarm`,
    method: "post",
    data
  });
}

// 查询重要通知分页
export function queryNoticeByPage(data:object) {
  return fetch({
    url: `/mro/notice/queryNoticeByPage`,
    method: "post",
    data
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

// 查询重要通知不分页
export function queryNotice(data:object) {
  return fetch({
    url: `/mro/notice/queryNotice`,
    method: "post",
    data
  });
}

//获取该组态信息
export function queryConfiguration(data:object) {
  return fetch({
    url: `/phmapi/projectMonitor/queryConfiguration`,
    method: "post",
    data
  });
}

// 查询设备离线
export function queryEquipmentStatusData(data:object) {
  return fetch({
    url: `/phmapi/dailyAlarmMonitor/queryEquipmentStatusData`,
    method: 'post',
    status: false,
    data
  })
}

/*********冷库昨日单位能耗排行榜*********/
export function queryEnergyRanking(data:object) {
  return fetch({
    url: `/phmapi/energyRanking/queryEnergyRankingListData`,
    method: "post",
    data
  });
}

/*********全景大屏*********/
export function queryYHSingleProjectScreen(data:any) {
  return fetch({
    url: `/phmapi/screen/queryYHSingleProjectScreen`,
    method: "post",
    data
  });
}

/*********全景大屏配置信息*********/
export function queryScreenConfigurations(data:any) {
  return fetch({
    url: `/configend/screenConf/queryScreenConfigurations`,
    method: "post",
    data
  });
}

// 运营因素分析
export function coolRoomTemperatureAnalysis(data:any) {
  return fetch({
    url: `/phmapi/statistic/coolRoomTemperatureAnalysis`,
    method: 'post',
    data
  })
}

// 库门监测
export function queryDoors(data:any) {
  return fetch({
    url: `/phmapi/projectMonitor/queryDoors`,
    method: 'post',
    data
  })
}

// 修正门指标统计
export function modifiedDoorStateStatistic(data:any) {
  return fetch({
    url: `/phmapi/statistic/modifiedDoorStateStatistic  `,
    method: "post",
    data
  });
}

// 修正能耗指标统计
export function modifiedEnergyConsumptionStatistic(data:any) {
  return fetch({
    url: `/phmapi/statistic/modifiedEnergyConsumptionStatistic `,
    method: "post",
    data
  });
}
// 修正水量指标统计
export function modifiedWaterConsumptionStatistic(data:any) {
  return fetch({
    url: `/phmapi/statistic/modifiedWaterConsumptionStatistic  `,
    method: "post",
    data
  });
}

// 查询水表测点
export function fetchCoolWaterPoint(data:string) {
  return fetch({
    url: `/phmapi/basisData/coolWaterPoint?projectUUid=${data}`,
    method: "get"
  });
}

// 查询能耗测点
export function queryEnergyPoint(data:string) {
  return fetch({
    url: `/phmapi/basisData/coolEnergyPoint?projectUUid=${data}`,
    method: "get"
  });
}


// 获取变量组
export function queryGroups(data:any) {
  return fetch({
    url: `/phmapi/projectMonitor/queryMonitorGroups`,
    method: "post",
    data
  });
}

// 获取变量组下的metric组下的数据
export function queryGroupsMetricData(data:any) {
  return fetch({
    url: `/phmapi/projectMonitor/queryMonitorMetricDatas`,
    method: "post",
    data
  });
}

export function trendAnalysisWithoutCompress(data:any) {
  return fetch({
    url: `/phmapi/statistic/trendAnalysisWithoutCompress`,
    method: "post",
    data
  });
}

//故障告警列表
export function queryDailyAlarms(data:any) {
  return fetch({
    url: `/phmapi/dailyAlarmMonitor/queryDailyAlarms`,
    method: "post",
    data
  });
}


// 关闭应急电话
export function insertAlarmStatus(params:any) {
  return fetch({
    url: `/phmapi/dailyAlarmMonitor/insertAlarmStatus`,
    method: "get",
    params
  });
}

// 打开应急电话
export function deleteAlarmStatus(params:any) {
  return fetch({
    url: `/phmapi/dailyAlarmMonitor/deleteAlarmStatus`,
    method: "get",
    params
  });
}
