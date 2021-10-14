<template>
<div class="cabin-screen-page" style="width:100%;height:100vh;overflow:hidden;position:relative;" id="main">
	<el-carousel ref="carousel" :height="height +'px'" @change="carouselChange" :autoplay="false">
		<el-carousel-item v-for="(item,index) in componentList" :key="index">
			<span v-if="item.componentsName">
				<singleChild :height="height" @ready="getChild" v-if="item.componentsName=='singleChild'"></singleChild>
			</span>
			<span v-else>
				<iframe style="width:100%;height:100vh;" :src="item.url"></iframe>
			</span>
		</el-carousel-item>
		<el-button id="puase-btn" class="puase-btn" type="primary" @click="handleAuto" :icon="play?'el-icon-video-pause':'el-icon-video-play'">{{play?'暂停':'开始'}}</el-button>
	</el-carousel>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	onUnmounted,
	nextTick,
	ref,
	computed,
	watch
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	queryYHSingleProjectScreen,
	queryScreenConfigurations
} from '@/api/intelligentMonitor/index';
import singleChild from './component/singleChild.vue';
import {
	_sortBy
} from '@/utils/lodash';
interface data {
	componentList: Array < any > ,
		single: string,
		height: number,
		currentCarousel: number,
		play: Boolean,
		isClick: Boolean,
}
export default defineComponent({
	components: {
		singleChild
	},
	setup() {
		const store = useStore();
		const state = store.state;
		let timeout: any;
		const obj: data = {
			componentList: [],
			single: '',
			height: 0,
			currentCarousel: 0,
			play: true,
			isClick: false,
		}
		const pageData = reactive(obj)
		const carousel: any = ref(null);
		const status = computed(() => state.common.carousel);
		watch(status, (nv, ov) => {
			console.log(nv, 'nv')
			if (nv) {
				clearTimeout(timeout)
				timer(pageData.currentCarousel)
			} else {
				clearTimeout(timeout)
			}
		})
		const queryScreenConfigurationsFun = async () => {
			await nextTick();
			queryScreenConfigurations({
				"projectUuid": state.common.currentProject.projectUuid,
				"queryInfo": {
					"page": 1,
					"size": 10
				},
				"companyId": 1,
				"pageNo": 1
			}).then((res: any) => {
				pageData.componentList = _sortBy(res.data.data.list, '');
				if (pageData.componentList.length != 0) {
					pageData.currentCarousel = pageData.componentList[0] ? pageData.componentList[0]['duration'] : 0;
				}
			})
		};
		const getChild = (s: Boolean) => {
			if (s === true) timer(Number(pageData.currentCarousel));
		};
		const timer = (time: number) => {
			timeout = setTimeout(() => {
				carousel.value.next();
			}, time)
			console.log(time, timeout, 'time')

		};
		const height = async () => {
			await nextTick();
			const ele = document.getElementById('main');
			pageData.height = ele ? ele.clientHeight : 0;
		};
		const handleAuto = () => {
			if (pageData.play) {
				pageData.play = false;
				clearTimeout(timeout)
			} else {
				pageData.play = true;
				timer(Number(pageData.currentCarousel))
			}
		};

		const carouselChange = (n: any) => {
			console.log('change', timeout)
			clearTimeout(timeout)
			pageData.currentCarousel = pageData.componentList[n].duration;
			timer(Number(pageData.componentList[n].duration))
		}
		onMounted(() => {
			height();
			queryScreenConfigurationsFun()

		})
		return {
			...toRefs(pageData),
			carousel,
			handleAuto,
			carouselChange,
			getChild,
		}
	}
})
</script>
<style lang="scss" scoped>
.puase-btn {
    position: absolute;
    z-index: 99;
    right: 20px;
    bottom: 10px;
    opacity: 0.5;
    background-color: rgba(44,106,241,0.3);
    height: 40px;
    display: flex!important;
    align-items: center;
    .el-icon-video-pause,
    .el-icon-video-play {
        font-size: 22px;
    }
}
.next {
    position: absolute;
    left: -1000px;
    top: -10000px;
}
</style>
