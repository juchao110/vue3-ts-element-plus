/*
 **全局公用方法
 */

export default function() {
  function setLocal(key:any, value:any,type?:string) {
    if(type=='session') sessionStorage.setItem(key, JSON.stringify(value))
    else localStorage.setItem(key, JSON.stringify(value))
  }

  function getLocal(key:any,type?:string) {
    if(type=='session'){
      const value:any = sessionStorage.getItem(key);
      return value?JSON.parse(value):null
    }
    else{
      const value:any = localStorage.getItem(key);
      return value?JSON.parse(value):null
    }

  }

  function removeLocal(key:any,type?:string) {
    if(type=='session') sessionStorage.removeItem(key)
    else localStorage.removeItem(key)
  }

  function testPhone(phone:string){
    let phoneReg = /^0?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[57]|16[6]|19[89])[0-9]{8}$/;
      return phoneReg.test(phone)
  }
  return {
    setLocal,
    getLocal,
    removeLocal,
    testPhone
  }
}
