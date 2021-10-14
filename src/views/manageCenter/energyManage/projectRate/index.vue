<template>
<el-tabs type="border-card" v-model="activeName" @tab-click="handleData">
	<el-tab-pane :label="item.name" :name="item.key" v-for="(item,index) in tabList" :key="index">
		<div class="mg-b-30">
			<el-date-picker class="mg-r-20" v-model="item.time" :type="timeRange()" value-format="x" start-placeholder="开始日期" end-placeholder="结束日期">
			</el-date-picker>
			<el-button type="primary" @click="getData">查询</el-button>
		</div>
		<Echart :options="item.options" :height="height"></Echart>
		<el-table :data="item.tableData" border stripe style="width: 100%">
			<el-table-column prop="date" fixed label="日期" width="120px" />
			<el-table-column v-for="(c,cindex) in item.columns" :key="cindex" :prop="c" :label="c" min-width="200px" />
		</el-table>
	</el-tab-pane>
</el-tabs>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	computed
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	queryMultiProjectsTemperatureNormalRate
} from '@/api/manageCenter/index';
import {
	_filter,
	_groupBy,
	_sortBy
} from '@/utils/lodash';
import global from '@/utils/global';
const tab = [{
	name: '日达标率',
	key: 'day'
}, {
	name: '周达标率',
	key: 'week'
}, {
	name: '月达标率',
	key: 'month'
}]
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;

		const {
			formatDate,
			fix
		}: object = global();
		const obj = {
			response: [],
			activeName: 'day',
			tabList: tab.map((e: object) => {
				return {
					...e,
					options: {},
					time: [new Date().setHours(0, 0, 0, 0) - 86400000 * 7, new Date().setHours(0, 0, 0, 0)],
					tableData: [],
					columns: []
				}
			})
		};
		const height = computed(() => state.common.multipleProject.length > 20 ? 800 : 500);
		const pageData = reactive(obj);
		const getCurrent = () => {
			return _filter(pageData.tabList, ({
				key
			}: object) => key == pageData.activeName)[0];
		};
		const getData = () => {
			queryMultiProjectsTemperatureNormalRate({
				startTime: getCurrent().time[0],
				endTime: getCurrent().time[1],
				projectIds: state.common.multipleProject
			}).then(({
				data
			}: object) => {
				pageData.response = data.data;
				handleData();
			})
		};
		const handleData = () => {
			getCurrent().columns = Object.keys(_groupBy(pageData.response, 'projectName'));
			const group = _groupBy(_sortBy(_filter(pageData.response, ({
				dayType
			}: object) => dayType == pageData.activeName), 'timestamp'), 'timestamp');
			const dataList = _groupBy(_sortBy(_filter(pageData.response, ({
				dayType
			}: object) => dayType == pageData.activeName), 'timestamp'), 'projectName');
			getCurrent().tableData = Object.keys(group).flatMap((k: string) => {
				return {
					date: formatDate(Math.floor(k), 'YYYY-MM-DD'),
					...Object.assign({}, ...group[k].map((e: object) => {
						let obj: object = {};
						obj[e.projectName] = fix(e.value * 100) + '%';
						return obj
					}))
				}
			})
			getCurrent().options = {
				legend: {
					data: getCurrent().columns,
					type: 'scroll',
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross'
					},
					confine: true
				},
				grid: {
					left: '5%',
					right: '5%'
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					data: Object.keys(group).map((e: string) => {
						return formatDate(Math.floor(e), 'YYYY-MM-DD')
					})
				},
				yAxis: [{
					name: '达标率（%）',
					type: "value",
					max: 100,
					boundaryGap: ['2%', '2%']
				}],
				series: Object.keys(dataList).map((k: string) => {
					return {
						name: k,
						type: 'line',
						showSymbol: false,
						smooth: true,
						data: _sortBy(dataList[k], 'timestamp').map((e: object) => {
							return fix(e.value * 100)
						})
					}
				})
			}
		};
		const timeRange = () => {
			switch (pageData.activeName) {
				case 'day':
					return 'daterange'
					break;
				case 'week':
					return 'daterange'
					break;
				case 'month':
					return 'monthrange'
					break;
			}
		};
		onMounted(() => {
			getData();
		});
		return {
			...toRefs(pageData),
			height,
			getData,
			handleData,
			timeRange
		}
	}
})
</script>
