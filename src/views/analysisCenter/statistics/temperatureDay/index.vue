<template>
<el-tabs type="border-card" v-model="activeName" @tab-click="handleClick">
	<el-tab-pane :label="item.roomName" :name="item.roomNumber" v-for="(item,index) in tabList" :key="index">
		<div class="search mg-b-20">
			<el-date-picker class="mg-r-20" v-model="date" type="daterange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
			</el-date-picker>
			<el-button type="primary" @click="handleClick">搜索</el-button>
		</div>
		<el-row :gutter="20">
			<el-col :span="8">
				<el-table :data="item.tableData" border style="width: 100%" :height="height">
					<el-table-column prop="date" label="日期" width="160">
					</el-table-column>
					<el-table-column v-for="(row,index) in arr" :key="index" :prop="row.key" :label="row.name">
					</el-table-column>
				</el-table>
			</el-col>
			<el-col :span="16">
				<Echart v-if="activeName==item.roomNumber" :options="item.options" :height="height<600?height:600"></Echart>
			</el-col>
		</el-row>
	</el-tab-pane>
</el-tabs>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	ref,
	computed
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	coolRoomStatistic
} from '@/api/statistics/index';
import {
	queryRooms
} from '@/api/paramsMonitor/index';
import {
	temperatureDay
} from '../../interface';
import {
	_sortBy,
	_filter
} from '@/utils/lodash';
import global from '@/utils/global';

export default defineComponent({
	setup(props: object) {
		const store = useStore();
		const state = store.state;
		const {
			formatDate,
			fix
		}: object = global();
		const arr = [{
			name: '最高温度',
			key: 'maxTemperature'
		}, {
			name: '平均温度',
			key: 'avgTemperature'
		}, {
			name: '最低温度',
			key: 'minTemperature'
		}];
		const height = computed(() => props.height);
		const obj: temperatureDay = {
			tabList: [],
			date: [new Date().setHours(0, 0, 0, 0) - 86400000 * 5, new Date().setHours(0, 0, 0, 0)],
			activeName: ''
		};
		const pageData = reactive(obj);
		const queryRoomsFun = () => {
			pageData.tabList = [];
			queryRooms({
				projectUuid: state.common.currentProject.projectUuid
			}).then(({
				data
			}: object) => {
				if (data.data && data.data.length == 0) return false;
				pageData.tabList = data.data;
				coolRoomStatisticFun(pageData.tabList[0].roomNumber);
			});
		};
		const filterCurrent = (id: string) => {
			return _filter(pageData.tabList, ({
				roomNumber
			}: object) => roomNumber == id)[0];
		};
		const coolRoomStatisticFun = (id: string) => {
			pageData.activeName = id;
			coolRoomStatistic({
				deviceCode: id,
				projectCode: state.common.currentProject.projectId,
				startDateTime: pageData.date[0],
				endDateTime: pageData.date[1]
			}).then(({
				data
			}: object) => {
				filterCurrent(id)['tableData'] = _sortBy(data.data, 'timestamp').map((item: object) => {
					item.date = formatDate(item.timestamp);
					item.avgTemperature = fix(item.avgTemperature);
					item.maxTemperature = fix(item.maxTemperature);
					item.minTemperature = fix(item.minTemperature);
					return item;
				});
				filterCurrent(id)['options'] = setOption(_sortBy(data.data, 'timestamp'));
			})
		};
		const handleClick = () => {
			coolRoomStatisticFun(pageData.activeName);
		};
		const setOption = (data: Array) => {
			return {
				tooltip: {
					trigger: 'axis',
				},
				color: ["#f00", "#07c160", "#00f"],
				legend: {
					data: ['最高温度', '平均温度', '最低温度']
				},
				grid: {
					left: "2%",
					right: "2%",
					containLabel: true
				},
				xAxis: {
					type: 'time',
					// data: data.map(({
					// 	timestamp
					// }: object) => formatDate(timestamp, 'MM-DD HH:mm:ss')),
					boundaryGap: false
				},
				yAxis: {
					name: '温度℃',
					type: 'value',
					boundaryGap: ['5%', '5%']
				},
				series: arr.map(({
					name,
					key
				}: object) => {
					return {
						name: name,
						type: 'line',
						lineStyle: {
							width: 1
						},
						showSymbol: false,
						data: data.map((item: object) => {
							return [item.timestamp, fix(item[key])]
						})
					}
				})
			}
		};
		onMounted(() => {
			queryRoomsFun();
		})
		return {
			...toRefs(pageData),
			arr,
			height,
			handleClick,
		}
	}
})
</script>
