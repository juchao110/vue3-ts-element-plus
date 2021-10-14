export interface roomTemperature{
  roomList: any,
  defaultActive: string|number,
  currentRoomName: string,
  currentItem:object,
  time:any,
  roomMonitorList:any,
  openNotice: Boolean,
  noticeList:Array<[]>,
  markArea:any
}

export interface projectParams{
  searchKey:string|number,
  tagList:any[],
  activeNames:string|number,
  responseList:Array<[]>,
  showTrend:Boolean,
  choosed:object
}

export interface editParams{
  searchWord:string,
  treeData:Array<[]>,
  pointList:Array<[]>,
  currentCheckedList:Array<[]>,
  dialogVisible: Boolean,
	changeValue: string,
	currentPoint: any,
  currentPage:number
}

export interface allParams{
  query:any,
  selectPoint:object,
  optionsInstanceProp:Array<[]>,
  pointList:Array<[]>,
  total:number,
  treeData:Array<[]>,
  choosed:object,
  showTrend:Boolean
}
