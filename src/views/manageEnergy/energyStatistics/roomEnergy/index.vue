<template>
<div class="room-energy-page">
	<div class="timer mg-b-20">
		分摊类型：
		<el-select v-model="methodType" placeholder="请选择" class="mg-r-20">
			<el-option label="面积分摊" value="area"> </el-option>
			<el-option label="冷风机时长" value="duration"> </el-option>
		</el-select>
		时间：
		<el-date-picker v-model="time" type="daterange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mg-r-20">
		</el-date-picker>
		<el-button type="primary" class="mg-r-20" @click="queryEnergyDataFun">搜索</el-button>
		<Csv :dataList="getExportList" :fileName="state.common.currentProject.projectName" :header="getExportHead"></Csv>
	</div>
	<el-tabs type="border-card" v-model="activeName" @tab-click="tabChange">
		<el-tab-pane :label="tab.name" :name="tab.key" v-for="(tab,index) in tabList" :key="index">
			<div class="each-tab-content">
				<div class="energy-chart" style="height:400px">
					<Echart :ref="tab.key" :options="tab.options" :height="400"></Echart>
				</div>
				<el-table :data="tab.tableData" show-summary stripe style="width: 100%">
					<el-table-column label="日期" align="center" fixed min-width="100">
						<template #default="scope">
							<span>{{ formatDate(scope.row.dateTime,'YYYY-MM-DD') }}</span>
						</template>
					</el-table-column>
					<el-table-column :label="col" v-for="(col,index) in tab.tableHead" :key="index" :prop="col" align="center" min-width="100">
					</el-table-column>
				</el-table>
			</div>
		</el-tab-pane>
	</el-tabs>
</div>
</template>
<script lang='ts'>
import {
	getCurrentInstance,
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	nextTick,
	ref
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	queryEnergyData,
	queryEnergyCompareData,
	queryEnergyEfficientCompareData
} from '@/api/manageEnergy/index';
import {
	_sortBy,
	_groupBy,
	_uniq,
	_filter
} from '@/utils/lodash';
import {
	roomEnergy
} from '../../interface';
import global from '@/utils/global';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			formatDate,
			fix
		}: any = global();
		const obj: roomEnergy = {
			methodType: "duration",
			time: [
				proxy.$root.$moment()
				.startOf("day")
				.valueOf() -
				86400000 * 7,
				proxy.$root.$moment()
				.startOf("day")
				.valueOf()
			],
			activeName: "energy",
			tabList: [],
			getExportList: [],
			getExportHead: []
		};
		const energy: any = ref(null),
			square: any = ref(null),
			cubic: any = ref(null);
		const pageData = reactive(obj);
		const queryEnergyDataFun = () => {
			pageData.tabList = [];
			queryEnergyData({
				startTime: pageData.time[0],
				endTime: pageData.time[1],
				projectId: state.common.currentProject.projectId,
				method: pageData.methodType
			}).then((res: any) => {
				const arr = _filter(res.data.data, (o: any) => o.system != '机房').map((e: any) => {
					e.value = fix(e.value);
					return e
				});
				pageData.tabList.push({
					name: '总能耗（kWh）',
					key: 'energy',
					datas: arr,
					tableData: handleFirstListData(arr).tableData,
					tableHead: handleFirstListData(arr).tableHead,
					options: {
						tooltip: {
							trigger: 'axis',
							confine: true
						},
						legend: {
							data: handleFirstListData(arr).tableHead.splice(1, handleFirstListData(arr).tableHead.length)
						},
						grid: {
							left: '5%',
							right: '5%',
						},
						xAxis: {
							type: 'category',
							data: Object.keys(_groupBy(_sortBy(arr, 'dateTime'), 'dateTime')).map((time: any) => formatDate(Number(time), 'YYYY-MM-DD'))
						},
						yAxis: {
							name: '总能耗（kWh）',
							type: 'value',
							boundaryGap: ['5%', '5%']
						},
						series: handleChartData(arr)
					}
				});
				pageData.getExportList = handleFirstListData(arr).tableData;
				pageData.getExportHead = ['日期', ...handleFirstListData(arr).tableHead];
				// const group = _.groupBy(_.filter(res.data.data, o => o.system != '机房'), "system");
				// this.totalItem = Object.keys(group).map(e => {
				// 	return {
				// 		system: e,
				// 		value: _sumBy(group[e], o => o.value)
				// 	};
				// });
				queryEnergyEfficientCompareDataFun();
			});
		};
		const queryEnergyEfficientCompareDataFun = () => {
			queryEnergyEfficientCompareData({
				startTime: pageData.time[0],
				endTime: pageData.time[1],
				projectId: state.common.currentProject.projectId,
				method: pageData.methodType
			}).then((res: any) => {
				const cubic = res.data.data.flatMap((data: any) => {
					data.cubicMetreEnergyCompareData.forEach((each: any) => {
						each.system = data.roomName;
						each.value = fix(each.currentValue);
					});
					return data.cubicMetreEnergyCompareData
				});
				const square = res.data.data.flatMap((data: any) => {
					data.squareMetreEnergyCompareData.forEach((each: any) => {
						each.system = data.roomName;
						each.value = fix(each.currentValue);
					});
					return data.squareMetreEnergyCompareData
				});
				pageData.tabList.push({
					name: '单位面积能耗（kWh/㎡）',
					key: 'square',
					data: square,
					tableData: handleFirstListData(square).tableData,
					tableHead: handleFirstListData(square).tableHead,
					options: {
						tooltip: {
							trigger: 'axis',
							confine: true
						},
						legend: {
							data: handleFirstListData(square).tableHead.splice(1, handleFirstListData(square).tableHead.length)
						},
						grid: {
							left: '5%',
							right: '5%',
						},
						xAxis: {
							type: 'category',
							data: Object.keys(_groupBy(_sortBy(square, 'dateTime'), 'dateTime')).map((time: any) => formatDate(Number(time), 'YYYY-MM-DD'))
						},
						yAxis: {
							name: '单位面积能耗（kWh/㎡）',
							type: 'value',
							min: 0,
							boundaryGap: ['5%', '5%']
						},
						series: handleChartData(square)
					}
				});
				pageData.tabList.push({
					name: '单位体积能耗（kWh/m³）',
					key: 'cubic',
					data: cubic,
					tableData: handleFirstListData(cubic).tableData,
					tableHead: handleFirstListData(cubic).tableHead,
					options: {
						tooltip: {
							trigger: 'axis',
							confine: true
						},
						legend: {
							data: handleFirstListData(cubic).tableHead.splice(1, handleFirstListData(cubic).tableHead.length)
						},
						grid: {
							left: '5%',
							right: '5%',
						},
						xAxis: {
							type: 'category',
							data: Object.keys(_groupBy(_sortBy(cubic, 'dateTime'), 'dateTime')).map((time: any) => formatDate(Number(time), 'YYYY-MM-DD'))
						},
						yAxis: {
							name: '单位体积能耗（kWh/m³）',
							type: 'value',
							min: 0,
							boundaryGap: ['5%', '5%']
						},
						series: handleChartData(cubic)
					}
				});
			});
		};

		const handleFirstListData = (data: Array < {} > ) => {
			data = data.map((e: any) => {
				let obj: any = {};
				obj[e.system] = e.value;
				obj['日期'] = formatDate(e.dateTime, 'YYYY-MM-DD');
				return {
					...e,
					...obj
				}
			});
			const group = _groupBy(_sortBy(data, 'dateTime'), 'dateTime');
			return {
				tableData: Object.keys(group).map((k: string) => {
					return Object.assign({}, ...group[k])
				}),
				tableHead: _uniq(_sortBy(data, 'orderNum').map((e: any) => e.system))
			}
		};
		const handleChartData = (data: Array < {} > ) => {
			const group = _groupBy(_sortBy(_filter(data, (d: any) => d.system != '总' && d.system != '冷库'), 'dateTime'), 'system');
			return Object.keys(group).map((k: string) => {
				return {
					name: k,
					type: 'bar',
					stack: 'total',
					barMaxWidth: 40,
					data: group[k].map((e: any) => e.value)
				}
			})
		};
		const tabChange = async (tab: any) => {
			await nextTick();
			pageData.getExportList = _filter(pageData.tabList, (e: any) => e.key == pageData.activeName)[0].tableData;
			pageData.getExportHead = ['日期', ..._filter(pageData.tabList, (e: any) => e.key == pageData.activeName)[0].tableHead];

			if (pageData.activeName === 'energy') energy.value.resizeChart();
			if (pageData.activeName === 'square') square.value.resizeChart();
			if (pageData.activeName === 'cubic') cubic.value.resizeChart();
		};
		onMounted(() => {
			queryEnergyDataFun();
		});
		return {
			...toRefs(pageData),
			formatDate,
			energy,
			square,
			cubic,
			tabChange,
			queryEnergyDataFun,
			state
		}
	}
})
</script>
<style media="screen" lang="scss">
@import '@/assets/scss/common.scss';
.room-energy-page {
    .each-tab-content {
        height: calc(100vh - 250px);
        overflow: scroll;
        overflow-x: hidden;
    }
}
</style>
