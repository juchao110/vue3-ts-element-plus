import {
  fetch
} from '@/utils/promise';

export function coolRoomStatistic(data:object) {
  return fetch({
    url: `/phmapi/statistic/coolRoomStatistic`,
    method: "post",
    data
  });
}

// 获取冷库温度达标率
export function queryTemperatureNormalRate(data:object) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryRichTemperatureNormalRate`,
    method: "post",
    data
  });
}

// 获取冷库温度达标率同比环比
export function queryTemperatureCompareData(data:object) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryRichTemperatureCompareData`,
    method: "post",
    data
  });
}

// 获取冷库温度异常原因分析
export function queryTemperatureAbnormalAnalysis(data:object) {
  return fetch({
    url: `/phmapi/energyAnalysis/queryRichTemperatureAbnormalAnalysis`,
    method: "post",
    data
  });
}

// 设备时长
export function equipmentAnalysis(params:object) {
  return fetch({
    url: `/phmapi/energyAnalysis/equipmentAnalysis`,
    method: "get",
    params
  });
}

// 获取系统接口
export function querySystem(params:object) {
  return fetch({
    url: `/phmapi/basisData/querySystem`,
    method: "get",
    params
  });
}
export function trendAnalysisWithoutCompress(data:object) {
  return fetch({
    url: `/phmapi/statistic/trendAnalysisWithoutCompress`,
    method: "post",
    data
  });
}

// 冷库运行周报记录
export function coolReportList(data:object) {
  return fetch({
    url: `/phmapi/coolOperationReportLog/queryListByPage`,
    method: "post",
    data
  });
}

export function reportReadNum(data:object) {
  return fetch({
    url: `/phmapi/coolOperationReportLog/updateReadNum`,
    method: "post",
    loading:false,
    data
  });
}
