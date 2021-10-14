import {
  fetch
} from '@/utils/promise';


export function loginIn(data:Object) {
  return fetch({
    url: `/user/user/login`,
    method: "post",
    data
  });
}
export function queryUserAccessModules(data:Object) {
  return fetch({
    url: `/user/user/queryUserAccessModules`,
    method: 'post',
    data,
    isMenu: true
  })
}

// 获取项目
export function queryProject(data:any) {
  return fetch({
    url: `/phmapi/userProject/queryUserProjects`,
    method: 'post',
    data
  })
}

// 查询版用户是否可进入
export function canAccessModule(data:any) {
  return fetch({
    url: '/user/userProjectRole/canAccessModule',
    method: 'post',
    data,
    // loading:false
  })
}
// 发送短信验证码
export function getCode(data:any) {
  return fetch({
    url: `/user/user/sendSmsValidCode`,
    method: "post",
    data,
    status:false
  });
}
// 重置密码
export function resetPassword(data:any) {
  return fetch({
    url: `/user/user/resetPassword`,
    method: "post",
    data
  });
}
