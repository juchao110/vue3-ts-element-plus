import {
  getCurrentInstance,
  ref
} from "vue";
import {
  _compact
} from '@/utils/lodash';
export default function(){
  const {proxy}:any = getCurrentInstance();
  /***
  **日期格式时间转时间戳
  ***/
  const timestamp = (time:string|number)=>{
    if(!time) return false;
    if(typeof(time)==='number') return time;
    return new Date(time).getTime();
  };

  const fix = (value:any,s:number=2)=>{
    if(value==null) return "-";
    if(typeof(value)==='string') return value;
    if(parseInt(value)===value) return value;
    else return value.toFixed(s)
  };

  const formatDate = (date:any,type:string='YYYY-MM-DD HH:mm:ss')=>{
    if(!date) return date;
    return proxy.$root.$moment(date).format(type)
  };

/**
*** 时长转 XX天XX小时XX分钟
**/
  const duration = (data:any,type:string='sec')=>{
    if (!data && data != 0) return "";
  if (typeof data !== "number") return data;
  const day:number = Math.floor(data / 86400000);
  var tempTime = proxy.$root.$moment.duration(data);
  var hours = tempTime.hours(),minutes = tempTime.minutes(),seconds=tempTime.seconds();
  if(type=='min') seconds=0;
  if (hours == 0 &&minutes == 0 &&seconds == 0) return "0秒";
  if (hours == 0 && minutes == 0)
    return `${day > 0 ? day + "天" : ""}${seconds?seconds+'秒':''}`;
  if (hours == 0)
    return `${day > 0 ? day + "天" : ""}${minutes?minutes+'分':''}${seconds?seconds+'秒':''}`;
  if (minutes == 0 && seconds == 0)
    return `${day > 0 ? day + "天" : ""}${hours}时`;
  else return `${day > 0 ? day + "天" : ""}${hours}时${minutes?minutes+'分':''}`;
};

/**
*** 获取随机颜色
**/
  const getRandomColor=()=> {
    var a:any, b:any, c:any;
    a = Math.floor(255 - Math.random() * 255).toString(16);
    b = Math.floor(255 - Math.random() * 255).toString(16);
    c = Math.floor(255 - Math.random() * 255).toString(16);
    return '#' + a + b + c;
    // return '#' + (Math.random() * 0xffffff << 0).toString(16)
  };



  return {
    timestamp,
    fix,
    formatDate,
    duration,
    getRandomColor
  }
}
