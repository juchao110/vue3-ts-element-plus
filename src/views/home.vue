<template>
<div class="root-home-page">
	<div class="main-box">
		<h4 class="main-title-box clearfloat">
			<img src="../assets/images/header/logo_white.png" class="logo-img" alt="">
			<p>冷库资产健康智慧管理</p>
		</h4>
		<ul class="clearfloat">
			<li>
				<div @click="jump('intelligentMonitor')" class="double-box">
					<img src="../assets/images/home/home_icon01.png">
				</div>
				<div @click="jump('manageCenter')" class="double-box">
					<img src="../assets/images/home/home_icon02.png">
				</div>
			</li>
			<li>
				<div @click="jump('manageEnergy')" class="tringle-box">
					<img src="../assets/images/home/home_icon03.png">
				</div>
			</li>
			<li>
				<div @click="jump('manageMro')" class="double-box">
					<img src="../assets/images/home/home_icon04.png">
				</div>
				<div @click="jump('manageAsset')" class="single-box l">
					<img src="../assets/images/home/home_icon05.png">
				</div>
				<div @click="jump('analysisCenter')" class="single-box l" style="margin-left: 15px">
					<img src="../assets/images/home/home_icon06.png">
				</div>
			</li>
			<li>
				<div @click="jump('manageSecurity')" class="single-box">
					<img src="../assets/images/home/home_icon07.png">
				</div>
				<div @click="jump('manageSystem')" class="single-box">
					<img src="../assets/images/home/home_icon08.png">
				</div>
			</li>
		</ul>
		<!--<div v-for="(link,index) in list" @click="jump(link)">{{link.meta.title}}</div>-->
	</div>

</div>
</template>

<script lang="ts">
import '@/assets/scss/home/index.scss';
import {
	defineComponent,
	reactive,
	toRefs,
	computed
} from "vue";
import {
	useStore
} from "vuex";
import {
	useRouter
} from "vue-router";
import {
	_filter,
	_sortBy
} from "@/utils/lodash";
import useGlobalFunction from '@/utils/useGlobalFunction';
import {
	ElMessage
} from 'element-plus';
export default defineComponent({
	setup() {
		const {
			setLocal
		} = useGlobalFunction();
		const store = useStore();
		const state = store.state;
		const router = useRouter();
		const list = computed(() => _filter(state.permission.response, (o: any) => o.meta.home == 1))
		const jump = (tag: any) => {
			const link = _filter(state.permission.response, (o: any) => o.moduleName == tag)[0];
			store.commit('permission/HANDLEROUTER', {
				routers: state.permission.response,
				id: link.parentId,
				mid: link.moduleId
			});
			if (link.children && link.children.length == 0) return ElMessage.warning('模块功能暂未开发，请等待');
			let url: string = '';
			url = url + link.path;
			if (link.children.length != 0) {
				_sortBy(link.children, 'sortNo').map((item: any, index: number) => {
					if (index === 0) {
						if (item.children.length == 0) url = url + '/' + item.path;
						else {
							url = url + '/' + item.path + '/' + item.children[0].path;
						}
					}
				})
			}
			setLocal('parentId', link.parentId, 'session');
			setLocal('moduleId', link.moduleId, 'session');
			setLocal("moduleNameUrl", url, 'session');
			setLocal("moduleName", link.meta.module, 'session');
			setLocal("moduleTitle", link.meta.title, 'session');
			setLocal('currentRouterPath', url, 'session');
			setLocal('isMany', link.meta.many == 1 ? 1 : 0, 'session');
			store.commit('common/SETCURRENTPATH', url);
			store.dispatch('common/setMany', link.meta.many == 1 ? 1 : 0);
			router.push({
				path: url
			})
		}
		return {
			list,
			jump
		}
	}
})
</script>

<style lang="css" scoped>
</style>
