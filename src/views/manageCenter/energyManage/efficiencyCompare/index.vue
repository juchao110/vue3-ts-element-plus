<template>
<el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
	<el-tab-pane :label="item.name" :name="item.key" v-for="(item,index) in tabList" :key="index">
		<div class="mg-b-30">
			<el-select v-model="item.type" class="mg-r-20" placeholder="请选择">
				<el-option label="冷库" value="全部"></el-option>
				<el-option label="冷藏库" value="冷藏库"></el-option>
				<el-option label="冷冻库" value="冷冻库"></el-option>
			</el-select>
			<el-select v-model="item.method" class="mg-r-20" placeholder="请选择">
				<el-option label="每平方米能耗" value="energySquareMetre"></el-option>
				<el-option label="每立方米能耗" value="energyCubicMetre"></el-option>
			</el-select>
			<el-date-picker @change="handleDateChange" class="mg-r-20" v-model="item.time" :type="item.key=='day'?'month':'year'" value-format="x" placeholder="请选择日期">
			</el-date-picker>
			<el-button type="primary" @click="handleSearch">查询</el-button>
		</div>
		<Echart :options="item.options" v-if="activeName==item.key" :height="height"></Echart>
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
	coolEnergyEfficiencyStatistic
} from '@/api/manageCenter/index';
import {
	_filter,
	_groupBy,
	_sortBy
} from '@/utils/lodash';
import global from '@/utils/global';
const tab = [{
	name: '日能耗指标',
	key: 'day'
}, {
	name: '月能耗指标',
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
			activeName: 'day',
			response: [],
			tabList: tab.map((e: object) => {
				return {
					...e,
					data: [],
					options: {},
					time: new Date().setHours(0, 0, 0, 0),
					type: '全部',
					method: 'energySquareMetre',
					status: false
				}
			})
		};
		const pageData = reactive(obj);
		const height = computed(() => state.common.multipleProject.length > 20 ? 800 : 500);
		const handleClick = () => {
			getData();
		};
		const handleSearch = () => {
			if (getCurrent().status === true) return getData();
			handleEchart();
		};
		const getCurrent = () => {
			return _filter(pageData.tabList, ({
				key
			}: object) => key == pageData.activeName)[0];
		};
		const getData = () => {
			getCurrent().status = false;
			coolEnergyEfficiencyStatistic({
				dateTime: getCurrent().time,
				coolNums: state.common.multipleProject,
				type: getCurrent().key
			}).then(({
				data
			}: object) => {
				pageData.response = data.data;
				handleEchart();
			})
		};
		const handleDateChange = () => {
			getCurrent().status = true;
		};
		const handleEchart = () => {
			const data = _filter(pageData.response, ({
				roomType
			}: object) => roomType == getCurrent().type);
			const group = _groupBy(data, 'projectName');
			getCurrent().options = {
				legend: {
					data: Object.keys(group),
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
					data: _sortBy(Object.keys(_groupBy(data, 'dateTime'))).map((e: string) => {
						return formatDate(Math.floor(e), getCurrent().key == 'day' ? 'YYYY-MM-DD' : 'YYYY-MM')
					})
				},
				yAxis: [{
					name: null,
					type: "value",
					boundaryGap: ['2%', '2%']
				}],
				series: Object.keys(group).map((k: string) => {
					return {
						name: k,
						type: 'line',
						showSymbol: false,
						smooth: true,
						data: _sortBy(group[k], 'dateTime').map((e: object) => {
							return fix(e[getCurrent().method])
						})
					}
				})
			}
		};
		onMounted(() => {
			getData();
		});
		return {
			...toRefs(pageData),
			handleSearch,
			handleDateChange,
			handleClick,
			height
		}
	}
})
</script>
