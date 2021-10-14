import {
  getCurrentInstance,
  ref
} from "vue";
import {
  _compact
} from '@/utils/lodash';
export default function(){
  const {proxy}:any = getCurrentInstance();

  const doParams = (point:any)=> {
      var params:any = {};
      if (!!point) {
        var pointArr = point.split("_");
        pointArr.map((e:any) => {
          if (e.substring(0,1) == 'P') {
            params.proId = e.substring(1,e.length);
          } else if (e.substring(0,3) == 'SIG') {
            params.sysNoId = e.substring(3, e.length);
          } else if (e.substring(0,2) == 'UR') {
            params.roomNoId = e.substring(2, e.length);
          }
        })
      }
      if (!!params.proId && !!params.sysNoId && !!params.roomNoId) {
        params.requestParams = {...params};
      } else if (!!params.proId && !params.sysNoId && !params.roomNoId) {
        params.requestParams = {proIds: params.proId};
      } else if (!!params.proId && !params.sysNoId && !!params.roomNoId) {
        params.requestParams = {proId: params.proId, roomNoIds: params.roomNoId};
      }else if (!!params.proId && !!params.sysNoId && !params.roomNoId) {
        params.requestParams = {proId: params.proId, sysNoIds: params.sysNoId};
      }
      return params;
    };

    const getParamsStr=(params:any)=> {
      var paramsStr = '';
      if (!!params.roomNoId || !!params.sysNoId) paramsStr = _compact([params.roomNoId,params.sysNoId]).join("_");
      else paramsStr = params.proId;
      return paramsStr;
    };

    const setExtend=(chartList:any, noticeList:Array<[]>, type:any)=> {
      return {
        series: {
          barMaxWidth: 50,
          markArea: type == 'day' ? setDayMarkArea(chartList, noticeList) : setDayTimeMarkArea(chartList, noticeList)
        },
        tooltip:  {
            formatter: (params:any) => {
              return type == 'day' ? setTooltipFormatter(params, noticeList) : setTooltipDateFormatter(params, noticeList);
            }
          }
        }
    };

    const setTooltipDateFormatter=(params:any, noticeList:Array<[]>)=> {
        var val = params[0];
        var div = `<p style=" text-align: left;">${proxy.$root.$moment(val.axisValue).format("HH:mm M-D")}</p>
      <p style=" text-align: left;">${val.marker}${val.seriesName}: ${Number(val.value[1]).toFixed(2)}</p>`
        noticeList.map((e:any) => {
          var endStr = !!e.solveTime ? proxy.$root.$moment(e.solveTime).format("YYYY-MM-DD HH:mm") : null;
          endStr = !!e.rentState ? '招租中' : endStr;
          endStr = !!e.ensureState ? '待确认' : endStr;
          if ((val.axisValue > e.startTime || val.axisValue == e.startTime)
           && (!e.solveTime || (!!e.solveTime && (val.axisValue < e.solveTime || val.axisValue == e.solveTime)))) {
            div += `<div>
            <p style=" text-align: left;">
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:rgba(255, 173, 177, 0.4);"></span>
            通知: ${e.noticeTypeName}通知${e.noticeType == 3 ? "("+e.proSysName+")" : ''}${e.noticeType == 4 ? "("+e.roomName+")" : ''}</p>
            <p style=" text-align: left;">
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;"></span>
            开始时间: ${proxy.$root.$moment(e.startTime).format("YYYY-MM-DD HH:mm")}</p>
            <p style=" text-align: left;">
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;"></span>
            恢复时间: ${endStr}</p>
            </div>`
          }
        })
        return div
    };

    const setTooltipFormatter=(params:any, noticeList:Array<[]>)=> {
        var val = params[0];
        var timestemp = new Date(val.axisValue).getTime();
        var div = `<p>${val.axisValue}</p><p>${val.marker}${val.seriesName}: ${val.value}</p>`
        noticeList.map((e:any) => {
          var endStr = !!e.solveTime ? proxy.$root.$moment(e.solveTime).format("YYYY-MM-DD HH:mm") : null;
          endStr = !!e.rentState ? '招租中' : endStr;
          endStr = !!e.ensureState ? '待确认' : endStr;
          var isSameDay = proxy.$root.$moment(timestemp).format("YYYY-MM-DD") == proxy.$root.$moment(e.startTime).format("YYYY-MM-DD") ? true : false;
          if ((timestemp > e.startTime || timestemp == e.startTime)
           && (!e.solveTime || (!!e.solveTime && (timestemp < e.solveTime || timestemp == e.solveTime)))
          || isSameDay) {
            div += `<div>
            <p>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:rgba(255, 173, 177, 0.4);"></span>
            通知: ${e.noticeTypeName}通知${e.noticeType == 3 ? "("+e.proSysName+")" : ''}${e.noticeType == 4 ? "("+e.roomName+")" : ''}</p>
            <p>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;"></span>
            开始时间: ${proxy.$root.$moment(e.startTime).format("YYYY-MM-DD HH:mm")}</p>
            <p>
            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;"></span>
            恢复时间: ${endStr}</p>
            </div>`
          }
        })
        return div
    };

    const setDayTimeMarkArea=(chartList:any, noticeList:Array<[]>)=> {
      console.log(chartList,noticeList,'noticeList')
     return {
        itemStyle: {
                  color: 'rgba(255, 173, 177, 0.4)'
              },
        data: noticeList.map((e:any) => {
            var chartLastDay = new Date(chartList[chartList.length - 1].date);
            var end = '';
          // 控制边界区域
            if (!e.solveTime) { // 无结束时间，开始时间大于最后时间，则结束时间设置和开始时间相同。小于最后时间，则设置成最后时间
              end = e.startTime > chartLastDay.getTime() ? e.startTime : chartLastDay.getTime();
              console.log(chartLastDay.getTime());
            } else if (e.startTime > chartLastDay.getTime()) {
              // 有结束时间，但是开始时间大于最后时间，则设置成开始时间
              end = e.startTime;
            } else{
              // 有结束时间，开始时间小于最后时间。
              // 则判断结束时间大于最后时间
              if (e.solveTime > chartLastDay.getTime()) {
              // 结束时间和最后时间是相同的，则使用结束时间，不相同,则使用最后时间
              end = (e.solveTime - chartLastDay.getTime()) > 0 ? e.solveTime : chartLastDay.getTime()
              } else {
                // 结束时间小于最后时间
                end = e.solveTime;
              }
            }
            return [
              {xAxis: e.startTime},
              {xAxis: end}]
          })
      }
    };

    const setDayMarkArea=(chartList:any, noticeList:Array<[]>)=> {
      return {
        itemStyle: {
                  color: 'rgba(255, 173, 177, 0.4)'
              },
        data: noticeList.map((e:any) => {
            var chartLastDay = new Date(chartList[chartList.length - 1].timestamp);
            var end:string|number = '';
          // 控制边界区域
            if (!e.solveTime) { // 无结束时间，开始时间大于最后时间，则结束时间设置和开始时间相同。小于最后时间，则设置成最后时间
              end = e.startTime > chartLastDay.getTime() ? e.startTime : chartLastDay.getTime();
              console.log(proxy.$root.$moment(end).format("YYYY-MM-DD"));
            } else if (e.startTime > chartLastDay.getTime()) {
              // 有结束时间，但是开始时间大于最后时间，则设置成开始时间
              end = e.startTime;
            } else{
              // 有结束时间，开始时间小于最后时间。
              // 则判断结束时间大于最后时间
              if (e.solveTime > chartLastDay.getTime()) {
              var solveTimeDay = new Date(e.solveTime);
              var chartStemp = new Date(`${chartLastDay.getFullYear()}-${chartLastDay.getMonth()+1}-${chartLastDay.getDate()} 00:00:00`).getTime();
              var solveTimeStemp = new Date(`${solveTimeDay.getFullYear()}-${solveTimeDay.getMonth()+1}-${solveTimeDay.getDate()} 00:00:00`).getTime();
              // 结束时间和最后时间是同一天，则使用结束时间，不是同一天,则使用最后时间
              end = (solveTimeStemp - chartStemp) > 0 ? chartStemp : solveTimeStemp
              } else {
                // 结束时间小于最后时间
                end = e.solveTime;
              }
            }
            return [
              {xAxis: proxy.$root.$moment(e.startTime).format("YYYY-MM-DD")},
              {xAxis: proxy.$root.$moment(end).format("YYYY-MM-DD")}]
          })
      }
    }
    return {
      doParams,
    getParamsStr,
    setExtend,
    setTooltipDateFormatter,
    setTooltipFormatter,
    setDayTimeMarkArea,
    setDayMarkArea
    }
}
