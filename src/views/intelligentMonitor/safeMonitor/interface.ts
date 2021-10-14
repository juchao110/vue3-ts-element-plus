
export interface pipeHeat{
  list: any,
  showTrend:Boolean,
  choosed:any
}

export interface doorSafe extends pipeHeat {
  realTimeList:Array<[]>,
  alarmTrendList:Array<[]>,
}

export interface fanDefrost extends pipeHeat{
  alarmTrendList: Array<any>,
}


export interface pressureSafe extends pipeHeat{

}
