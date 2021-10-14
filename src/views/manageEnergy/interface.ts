export interface roomEnergy{
  methodType: string,
  time: Array<string|number>,
  activeName: string,
  getExportList: Array<any>,
  getExportHead: Array<any>,
  tabList:Array<any>
}

export interface energyFlow{
  time:string|number,
  dayType:string,
  options:any,
  tableData:Array<object>
}

export interface energyProportion{
  tabList:Array<any>,
  activeName:string
}

export interface monthRead{
  type:string,
  method:string,
  day:number,
  dayType:string,
  time:Array<any>,
  list:Array<any>,
  activeName:string
}
