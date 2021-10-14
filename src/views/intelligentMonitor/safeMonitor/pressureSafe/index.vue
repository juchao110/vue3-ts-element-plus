<template>
<div class="pressure-safe-page">
	<ul class="pressure-page-ul">
		<li v-for="(sys,index) in list" :key="index">
			<h4>{{sys.sysName}}</h4>
			<el-row :gutter="20">
				<el-col :span="6">
					<img class="sys-image" :src="state.common.fileBaseurl+sys.coolSystemInfoData.sysTemPic||null">
				</el-col>
				<el-col :span="18">
					<div class="clearfloat">
						<div class="sys-info l mg-r-20"> 制冷方式：<span :title="sys.coolSystemInfoData.sysTempName">{{sys.coolSystemInfoData.sysTempName}}</span></div>
						<div class="sys-info l"> 制冷剂：{{sys.coolSystemInfoData.cryogenName}}</div>
					</div>
					<div class="alarm-list ">
						<div class="each clearfloat">
							<p>储液器安全</p>
							<div v-if="sys.hprRealTimeData.length!=0">
								<div v-for="(alarm,hindex) in sys.hprRealTimeData" :key="'h'+hindex" @click="showTrendAsy(alarm)">
									<div class="point-name" :title="alarm.name">{{alarm.name}}</div>
									<div class="point-value">
										<span>{{alarm.realTimeValue|tofix}}{{alarm.unit}}</span>
										<i class="el-icon-bell" :style="{color:alarm.alarmFlag?'red':'grey'}"></i>
									</div>
								</div>
							</div>
							<strong class="mg-b-20" style="display:block;" v-else>暂无测点</strong>
						</div>
						<div class="each clearfloat">
							<p>其他</p>
							<div v-if="sys.coolSafeRealTimeData.length!=0">
								<div class="clearfloat" v-for="(alarm,aindex) in sys.coolSafeRealTimeData" :key="aindex" @click="showTrendAsy(alarm)">
									<div class="point-name" :title="alarm.name">{{alarm.name}}</div>
									<div class="point-value">
										<span>{{fix(alarm.realTimeValue)}}{{alarm.unit}}</span>
										<i class="el-icon-bell" :style="{color:alarm.alarmFlag?'red':'grey'}"></i>
									</div>
								</div>
							</div>
							<strong class="mg-b-20" style="display:block;" v-else>暂无测点</strong>
						</div>
					</div>
				</el-col>
			</el-row>
		</li>
	</ul>
	<el-dialog title="测点趋势" v-model="showTrend" width="60%">
		<Trend :time="choosed.time" :pointCode="choosed.insPropCode" :pointName="choosed.name" :metric="choosed.metric"></Trend>
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
import global from "@/utils/global";
import {
	pressureSafe
} from '../interface';
import {
	queryCoolSafe
} from '@/api/safeMonitor/index';
import {
	_groupBy,
	_sortBy,
	_filter
} from '@/utils/lodash';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: pressureSafe = {
			list: {},
			showTrend: false,
			choosed: {
				time: []
			}
		};
		const pageData = reactive(obj);
		const {
			fix,
			formatDate
		}: any = global();
		const queryCoolSafeFun = () => {
			queryCoolSafe({
				"modules": ["PRESSURE"],
				"projectId": state.common.currentProject.projectId,
				'projectUuid': state.common.currentProject.projectUuid,
				"isAuthorityOn": false
			}).then((res: any) => {
				pageData.list = res.data.data.PRESSURE || [];
			})
		};
		const showTrendAsy = (row: any) => {
			pageData.choosed = row;
			pageData.choosed['time'] = row.alarmFlag ? [row.alarmTime - 60 * 60 * 1000, row.alarmTime + 60 * 60 * 1000] : [new Date().getTime() - 60 * 60 * 1000, new Date().getTime()];
			pageData.showTrend = true;
		};
		onMounted(() => {
			queryCoolSafeFun();
		})
		return {
			...toRefs(pageData),
			fix,
			state,
			showTrendAsy
		}
	}
})
</script>
