import { createApp ,h} from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/permission/permission';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/assets/scss/style.scss';
import {_upperFirst,_camelCase}  from '@/utils/lodash';

const app = createApp(App);

const echarts = require('echarts');
app.config.globalProperties.$echarts = echarts;
const moment = require('moment');
app.config.globalProperties.$moment = moment;

const requireComponent = require.context('./components',true,/.vue$/)
requireComponent.keys().forEach((fileName:any) => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName)
  // 获取组件的 PascalCase 命名
  const componentName = _upperFirst(
    _camelCase(
      // 获取和目录深度无关的文件名
      fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')
    )
  )
  // 全局注册组件
  app.component(
    componentName,
    // 如果这个组件选项是通过 `export default` 导出的，
    // 那么就会优先使用 `.default`，
    // 否则回退到使用模块的根。
    componentConfig.default || componentConfig
  )
})
app.use(ElementPlus).use(store).use(router).mount('#app')
