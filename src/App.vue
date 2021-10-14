<template>
<keep-alive>
	<el-config-provider :locale="locale">
		<router-view />
	</el-config-provider>
</keep-alive>
</template>

<script lang='ts'>
import {
	defineComponent
} from 'vue';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
export default defineComponent({
	setup() {
		const locale: any = zhCn;
		return {
			locale
		}
	}
})
</script>
<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}
</style>
