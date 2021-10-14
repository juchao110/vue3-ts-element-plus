export interface alarm{
  time:Array<number>,
  level:string,
  typeArr:Array<object>,
  alarmDataType:Array<any>,
  alarmDataList:any,
  currentPage:number,
  pageSize:number,
  projectId:number,
  currentRow:any,
  searchAll:string,
  diagnosisParams:object,
  showTrend:Boolean
}
