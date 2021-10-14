import { createStore } from 'vuex'
import common from "./common/index";
import permission from "./router/index";
import bread from "./bread/index";

export default createStore({
  modules: {
    permission,
    common,
    bread
  }
})
