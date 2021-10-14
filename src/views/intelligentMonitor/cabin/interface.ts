export interface notice{
    speed:number,
    parentWidth:number,
    parentHeight:number,
    contentLength:number,
    state:number,
    firstAnimationTime:number,
    secondAnimationTime:number,
}

export interface home{
  noticeList:Array<any>,
  equipStatus:any,
  options:any,
  url:string,
  energyRankingList:Array<object>,
  energyRateList:Array<object>,
  energyLoad:Boolean,
  alarmList:Array<object>,
  choosed:any,
  showTrend:Boolean
}
