import axios from 'axios';
import store from '@/store';
import router from '@/router';
import getToken from "@/permission/getToken";
import {
  ElMessage
} from 'element-plus';
const BASEURL ="https://test.snowlink.cn/";
export function fetch(options:any) {
  if(!options.loading) store.dispatch('common/setLoading',true);
  let header = {
    token: getToken(),
  };
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      headers: {
        SYSTEMCODE: "PHM_MRO_PC",
        ...header
      }, //请求头
      baseURL: BASEURL,
      timeout: 45 * 1000 //超时时间
    });
    instance.interceptors.request.use(
      config => {
        // config.data.userId = store.state.userInfo.id //统一传入userId
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    instance(options)
      .then(response => {
        store.dispatch('common/setLoading',false);
        if (response.data.code == 300) {
          ElMessage({
            message:'登录失效，请重新登录',
            type:'error'
          })
          console.log(router)
          router.replace({
            path:'/login/loginin'
          })
          return;
        }
        if (
          response.data.code !== null &&
          parseInt(response.data.code) !== 0 &&
          response.data.code !== 200
        ) {
          ElMessage({
            message:response.data.message,
            type:'error'
          });
          return;
        }
        resolve(response);
      })
      .catch(error => {
        store.dispatch('common/setLoading',false);
        ElMessage({
          message:'网络异常，请稍后再试',
          type:'error'
        });
        reject(error);
      });
  });
}
