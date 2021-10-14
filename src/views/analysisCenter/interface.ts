export interface temperatureDay {
  tabList:Array<object>,
  date?:Array<string|number>,
  activeName:string
}

export interface rate {
  tableData:Array<object>,
  date:Array<string|number>,
  options:object,
  tableHead:Array<string>,
  chartList:Array<object>
}

export interface equipmentTime extends temperatureDay{
  systemList:Array<object>,
  system:string,
  response:object,
  dataLoading:Boolean
}

export interface queryData {
  systemGroupList:Array<object>,
  pointList:Array<object>,
  point:string,
  response:Array<object>,
  choosedPointList:Array<object>,
  options:object,
  form:object,
  currentSelect:number
}

export interface monthExport {
  params:object,
  selectionRows:Array<string>,
  list:Array<object>
}
