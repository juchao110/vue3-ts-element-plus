<template>
<div class="search mg-b-30">
	<el-select v-model="range" placeholder="请选择周期" class="mg-r-20">
		<el-option key="day" label="日" value="day"> </el-option>
		<el-option key="week" label="周" value="week"> </el-option>
		<el-option key="month" label="月" value="month"> </el-option>
	</el-select>
	<el-date-picker class="mg-r-20" v-model="date" :type="range == 'month' ? 'monthrange' : 'daterange'" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
	</el-date-picker>
	<el-button type="primary" @click="queryTemperatureNormalRateFun">搜索</el-button>
</div>
<div class="chart-list">
	<Echart :options="options" :height="400"></Echart>
	<div class="button-list mg-b-30">
		<el-button class="mg-r-20" :type="current==btn.name?'primary':''" v-for="(btn,index) in chartList" :key="index" @click="handleChartChange(btn)">{{btn.name}}</el-button>
	</div>
</div>
<el-table :data="tableData" border style="width: 100%">
	<el-table-column label="日期" prop='日期' fixed align="center" min-width="100">
	</el-table-column>
	<el-table-column :label="col" v-for="(col,index) in tableHead" :key="index" :prop="col" align="center" min-width="100">
		<template #default="scope">
			<span :style="{color:scope.row[col+'remark']==true?'red':''}">{{scope.row[col]}}%</span>
		</template>
	</el-table-column>
</el-table>
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
	queryTemperatureNormalRate,
	queryTemperatureCompareData,
	queryTemperatureAbnormalAnalysis
} from '@/api/statistics/index';
import {
	_sortBy,
	_groupBy,
	_uniq,
	_filter
} from '@/utils/lodash';
import {
	rate
} from '../../interface';
import global from '@/utils/global';
const arr = [{
	name: '同比达标率',
	key: 'lastYearValue'
}, {
	name: '环比达标率',
	key: 'lastMonthValue'
}];
export default defineComponent({
	props: {
		height: 0
	},
	setup(props: object) {
		const store = useStore();
		const state = store.state;
		const {
			fix,
			formatDate
		}: object = global();
		const obj: rate = {
			range: 'day',
			date: [new Date().setHours(0, 0, 0, 0) - 86400000 * 7, new Date().setHours(0, 0, 0, 0)],
			options: {},
			current: '',
			tableData: [],
			tableHead: [],
			chartList: []
		};
		const pageData = reactive(obj);
		const queryTemperatureNormalRateFun = () => {
			queryTemperatureNormalRate({
				startTime: pageData.date[0],
				endTime: pageData.date[1],
				projectId: state.common.currentProject.projectId
			}).then(({
				data
			}: object) => {
				const list = _filter(data.data, ({
					roomName,
					dayType
				}: object) => roomName !== '权重' && dayType === pageData.range).map((item: object) => {
					item.value = fix(item.value * 100);
					return item;
				});
				const {
					tableData,
					tableHead
				}: object = handleFirstListData(list);
				pageData.tableData = tableData;
				pageData.tableHead = tableHead;
				queryTemperatureCompareDataFun();
			})
		};
		const queryTemperatureCompareDataFun = () => {
			queryTemperatureCompareData({
				startTime: pageData.date[0],
				endTime: pageData.date[1],
				projectId: state.common.currentProject.projectId
			}).then(({
				data
			}: object) => {
				const compareList: Array < object > = _filter(data.data, ({
					roomName
				}: object) => roomName !== "权重");
				if (compareList.length == 0) return false;
				pageData.chartList = compareList.map((item: object, key: string) => {
					const xList: Array = pageData.range === 'day' ? _sortBy(item.dayCompareData, 'dateTime') : pageData.range === 'week' ? _sortBy(item.weekCompareData, 'dateTime') : _sortBy(item.monthCompareData, 'dateTime');
					return {
						name: item.roomName,
						options: {
							tooltip: {
								trigger: 'axis',
								confine: true
							},
							legend: {
								data: [item.roomName, '同比达标率', '环比达标率']
							},
							grid: {
								left: '5%',
								right: '5%',
							},
							xAxis: {
								type: 'category',
								boundaryGap: false,
								data: Object.keys(_groupBy(_sortBy(xList, 'dateTime'), 'dateTime')).map((time: any) => formatDate(Number(time), pageData.range == 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'))
							},
							yAxis: {
								name: '达标率（%）',
								type: 'value',
								boundaryGap: false,
								max: 100
							},
							series: [{
								name: item.roomName,
								type: 'line',
								lineStyle: {
									width: 1
								},
								showSymbol: false,
								data: xList.map(({
									currentValue
								}: object) => fix(currentValue * 100))
							}, ...arr.map((each: object) => {
								return {
									name: each.name,
									type: 'line',
									lineStyle: {
										width: 1
									},
									showSymbol: false,
									data: xList.map((value: object) => fix(value[each.key] * 100))
								}
							})]
						}
					}
				})
				pageData.options = pageData.chartList[0].options;
				pageData.current = pageData.chartList[0].name;
			});
		};
		const handleChartChange = (item: object) => {
			pageData.options = item.options;
			pageData.current = item.name;
		};
		const handleFirstListData = (data: Array < {} > ) => {
			data = data.map((e: object) => {
				let obj: any = {};
				obj[e.roomName] = e.value;
				obj[e.roomName + 'remark'] = e.remark;
				obj['日期'] = formatDate(e.timestamp, 'YYYY-MM-DD');
				return {
					...e,
					...obj
				}
			});
			const group = _groupBy(_sortBy(data, 'timestamp'), 'timestamp');
			return {
				tableData: Object.keys(group).map((k: string) => {
					return Object.assign({}, ...group[k])
				}),
				tableHead: _uniq(_sortBy(data, 'sortFlag').map((e: object) => e.roomName))
			}
		};
		onMounted(() => {
			queryTemperatureNormalRateFun();
		});
		return {
			...toRefs(pageData),
			formatDate,
			...props,
			queryTemperatureNormalRateFun,
			handleChartChange
		}
	}
})
</script>
<style media="screen" lang="scss" scoped>
.chart-list {
    text-align: center;
}
</style>
