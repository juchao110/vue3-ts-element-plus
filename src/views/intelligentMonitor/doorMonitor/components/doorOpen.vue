<template>
<div class="door-open-component">
	<div class="">
		<el-date-picker v-model="dateRange" type="daterange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
		</el-date-picker>
		<el-button type="primary" @click="handleSearch">查询</el-button>
	</div>
	<div class="chart-box" v-loading="state.common.loading">
		<div class="chart" id="doorChart" style="height:400px"></div>
	</div>
	<el-table :data="list" stripe style="width: 100%">
		<el-table-column label="日期">
			<template #default="scope">
				{{ formatDate(scope.row.timestamp,'YYYY-MM-DD')}}
			</template>
		</el-table-column>
		<el-table-column label="开">
			<template #default="scope">
				{{ duration(scope.row.switchOnDuration)}}
			</template>
		</el-table-column>
		<el-table-column label="关">
			<template #default="scope">
				{{ duration(scope.row.switchOffDuration)}}
			</template>
		</el-table-column>
		<el-table-column label="平均开时长">
			<template #default="scope">
				{{ duration(scope.row.switchOnAvgDuration) }}
			</template>
		</el-table-column>
		<el-table-column prop="switchOnTimes" label="次数"></el-table-column>
		<el-table-column label="开占比">
			<template #default="scope">
				{{ fix(scope.row.switchOnPercent * 100) }}%
			</template>
		</el-table-column>
	</el-table>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	getCurrentInstance,
	nextTick,
	watch
} from 'vue';
import {
	useStore
} from 'vuex';
import global from "@/utils/global";
import {
	modifiedDoorStateStatistic
} from '@/api/intelligentMonitor/index';
import {
	_sortBy
} from '@/utils/lodash';
interface range {
	dateRange: any,
		list: Array < any >
}
const json = [{
	name: '开',
	key: 'switchOnDuration',
	type: 'bar'
}, {
	name: '关',
	key: 'switchOffDuration',
	type: 'bar'
}, {
	name: '平均开时长',
	key: 'switchOnAvgDuration',
	type: 'bar'
}, {
	name: '次',
	key: 'switchOnTimes',
	type: 'line'
}, {
	name: '开占比',
	key: 'switchOnPercent',
	type: 'line'
}]
export default defineComponent({
	props: {
		pointName: {
			type: String,
			default: '',
			required: true
		},
		pointCode: {
			type: String,
			default: '',
			required: true
		},
		metric: {
			type: String,
			default: '',
			required: true
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			fix,
			formatDate,
			duration
		}: any = global();
		const obj: range = {
			dateRange: [proxy.$root.$moment().startOf('day').format('x') - 86400000 * 7, proxy.$root.$moment().startOf('day').format('x') - 86400000],
			list: []
		};
		const pageData = reactive(obj);
		const getData = () => {
			modifiedDoorStateStatistic({
				endDateTime: pageData.dateRange[1],
				...props,
				projectCode: state.common.currentProject.projectId,
				startDateTime: pageData.dateRange[0]
			}).then((res: any) => {
				pageData.list = res.data.data;
				drawLine(res.data.data);
			})
		};
		const drawLine = async (list: any) => {
			await nextTick();
			const data = _sortBy(list, 'timestamp').map((e: any) => {
				e.switchOnDuration = (e.switchOnDuration / 1000 / 60).toFixed(2);
				e.switchOffDuration = (e.switchOffDuration / 1000 / 60).toFixed(2);
				e.switchOnAvgDuration = (e.switchOnAvgDuration / 1000 / 60).toFixed(2);
				e.switchOnPercent = (e.switchOnPercent * 100).toFixed(2);
				return e
			})
			const colors = ["#f44b53", "#558bee", "#08bb54", "#2e71eb", "#ff6600"];
			const chart = proxy.$root.$echarts.init(document.getElementById('doorChart'));
			chart.clear();
			chart.setOption({
				color: colors,
				tooltip: {
					trigger: 'axis',
					// formatter: (params) => {
					// 	console.log(params)
					// }
				},
				legend: {
					data: json.map((e: any) => e.name)
				},
				xAxis: [{
					type: 'category',
					data: data.map((item: any) => proxy.$root.$moment(item.timestamp).format('YYYY-MM-DD'))
				}],
				yAxis: [{
					type: 'value',
					name: '时长',
					max: 1440,
					axisLabel: {
						formatter: '{value} min'
					}
				}, {
					type: 'value',
					name: '开占比',
					max: 100,
					axisLabel: {
						formatter: '{value} %'
					}
				}],
				series: json.map((e: any) => {
					return {
						name: e.name,
						type: e.type,
						yAxisIndex: e.name == '开占比' ? 1 : 0,
						data: data.map((item: any) => item[e.key])
					}
				})
			})
		};
		watch(() => props.pointCode, (nv, ov) => {
			getData();
		})
		const handleSearch = () => {
			getData();
		};
		onMounted(() => {
			getData();
		})
		return {
			...toRefs(pageData),
			state,
			handleSearch,
			fix,
			formatDate,
			duration
		}
	}
})
</script>
