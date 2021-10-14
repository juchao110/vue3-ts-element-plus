<template>
<div class="door-monitor-page">
	<el-tabs type="border-card">
		<el-tab-pane :label="item.roomName" v-for="(item,index) in list" :key="index">
			<ul class="door-list">
				<li v-for="(e,eindex) in item.doors" :key="eindex">
					<img :src="getSrc(e.value)" alt="">
					<p @click="handleChart(e)">{{e.pointName}}
						<i class="iconfont">&#xe67f;</i>
					</p>
				</li>
			</ul>
		</el-tab-pane>
	</el-tabs>
	<el-dialog :title="choosed.pointName" v-model="showTrend" width="60%">
		<DoorOpen :pointCode="choosed.pointCode" :pointName="choosed.pointName" :metric="choosed.pointMetric"></DoorOpen>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="showTrend = false">取 消</el-button>
				<el-button type="primary" @click="showTrend = false">确 定</el-button>
			</span>
		</template>
	</el-dialog>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	queryDoors
} from '@/api/intelligentMonitor/index';
import {
	door
} from './interface';
import DoorOpen from './components/doorOpen.vue';
export default defineComponent({
	components: {
		DoorOpen
	},
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: door = {
			list: [],
			choosed: {},
			showTrend: false
		};
		const pageData = reactive(obj);
		const queryDoorsFun = () => {
			queryDoors({
				projectUuid: state.common.currentProject.projectUuid
			}).then((res: any) => {
				pageData.list = res.data.data;
			})
		};
		const getSrc = (value: any) => {
			if (Math.floor(value) == 1) return require('@/assets/images/safe/DASopenNormal.jpg');
			else return require('@/assets/images/safe/DAcloseNormal.jpg');
		};
		const handleChart = (e: any) => {
			pageData.choosed = e;
			pageData.showTrend = true;
		};
		onMounted(() => {
			queryDoorsFun();
		})
		return {
			...toRefs(pageData),
			getSrc,
			handleChart
		}
	}
})
</script>
<style lang="scss">
@import '@/assets/scss/common.scss';
.door-monitor-page {
    .door-list {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        @include padding(20px);
        li {
            width: 20%;
            text-align: center;
            @include margin_b(30px);
            img {
                height: 200px;
                @include margin_b(20px);
            }
            p {
                font-size: 18px;
                cursor: pointer;
                &:hover {
                    @extend .hover-class;
                }
            }
        }
    }
}
</style>
