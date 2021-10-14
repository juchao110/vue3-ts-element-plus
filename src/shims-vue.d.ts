/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component

}

declare module 'js-md5' {
  import md5 from 'js-md5'
  export default md5
}

declare module 'js-cookie' {
  import Cookies from 'js-md5'
  export default Cookies
}
