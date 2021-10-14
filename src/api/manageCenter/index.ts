import {
  fetch
} from '@/utils/promise';

// 获取冷库24小时报警
export function query24ProjectsAlarm(data:object) {
  return fetch({
    url: `/phmapi/projectAlarmMonitor/query24ProjectsAlarm`,
    method: "post",
    data
  });
}

// 获取冷库24小时报警详情
export function query24ProjectsAlarmDetail(data:object) {
  return fetch({
    url: `/phmapi/projectAlarmMonitor/query24ProjectsAlarmDetail`,
    method: "post",
    data
  });
}

// 查询昨日冷库能耗
export function queryEnergyTemRateData(data:object) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryEnergyTemRateData`,
    method: 'post',
    status: false,
    data
  })
}

// 查询冷库能效数据
export function queryMultiProjectsTemperatureNormalRate(data:object) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryMultiProjectsTemperatureNormalRate`,
    method: 'post',
    data
  })
}

// 查询冷库达标率
export function coolEnergyEfficiencyStatistic(data:object) {
  return fetch({
    url: `/phmapi/statistic/coolEnergyEfficiencyStatistic`,
    method: 'post',
    data
  })
}
