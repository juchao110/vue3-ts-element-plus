export interface dataQuery{
  activeName:string,
  systemGroupList:Array<any>,
  pointList:Array<any>,
  tabList:Array<any>,
  intervalList:Array<object>,
  isSearched:Boolean,
  header:Array<any>,
  exportList:Array<any>,
  downloadList:Array<any>
}

export interface form {
    systemGroup: number|string,
    points: Array<any>,
    time: Array<number>,
    interval: number|string,
    pointsList:Array<any>,
    currentSelect:number
}
