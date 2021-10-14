import {
  fetch
} from '@/utils/promise';
// 获取单冷库总能耗
export function queryEnergyData(data:any) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryEnergyData`,
    method: "post",
    data
  });
}

// 获取能耗同比环比
export function queryEnergyCompareData(data:any) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryEnergyCompareData`,
    method: "post",
    data
  });
}
// 获取能效同比环比
export function queryEnergyEfficientCompareData(data:any) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryEnergyEfficientCompareData`,
    method: "post",
    data
  });
}


// 获取能耗流向
export function queryEnergyManagement(data:any) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryEnergyManagement`,
    method: "post",
    data
  });
}


// 单冷库能耗占比
export function coolEnergyPercentStatistic(data:any) {
  return fetch({
    url: `/phmapi/statistic/coolEnergyPercentStatistic`,
    method: 'post',
    data
  })
}
