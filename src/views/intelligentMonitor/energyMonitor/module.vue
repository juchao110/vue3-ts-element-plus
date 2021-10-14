<template>
<div class="energy-monitor-page">
	<el-tabs type="border-card" v-model="active">
		<el-tab-pane :label="item.name" :name="item.key" v-for="(item,index) in list" :key="index">
			<div class="search mg-b-40">
				<el-select v-model="item.point" placeholder="请选择" class="width-300 mg-r-20">
					<el-option v-for="item in item.pointList" :key="JSON.stringify(item)" :label="item.ioPoint" :value="JSON.stringify(item)">
					</el-option>
				</el-select>
				<el-date-picker v-model="item.time" class="mg-r-20" type="daterange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
				</el-date-picker>
				<el-button type="primary" @click="searchAction">搜索</el-button>
				显示重要通知
				<el-switch v-model="item.openNotice" active-color="#13ce66" inactive-color="#ccc" @change="getNoticeAndChartFun">
				</el-switch>
			</div>
			<div class="energy-body">
				<div :id="item.key" style="height:500px"></div>
				<el-table :data="item.data" stripe style="width: 100%">
					<el-table-column label="日期">
						<template #default="scope">
							{{ formatDate(scope.row.timestamp,'YYYY-MM-DD') }}
						</template>
					</el-table-column>
					<el-table-column :label="active==='energy'?'当前能耗（kWh）':'当前水耗（m³）'">
						<template #default="scope">
							{{fix(active==='energy'?scope.row.energyConsumption:scope.row.waterConsumption) }}
						</template>
					</el-table-column>
					<el-table-column :label="active==='energy'?'开始能耗（kWh）':'开始水耗（m³）'">
						<template #default="scope">
							{{ fix(active==='energy'?scope.row.startEnergyConsumption:scope.row.startWaterConsumption)}}
						</template>
					</el-table-column>
					<el-table-column :label="active==='energy'?'结束能耗（kWh）':'结束水耗（m³）'">
						<template #default="scope">
							{{ fix(active==='energy'?scope.row.endEnergyConsumption:scope.row.endWaterConsumption) }}
						</template>
					</el-table-column>
					<el-table-column prop="isModified" label="备注"></el-table-column>
				</el-table>
			</div>
		</el-tab-pane>
	</el-tabs>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	onMounted,
	watch,
	nextTick
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	modifiedEnergyConsumptionStatistic,
	modifiedWaterConsumptionStatistic,
	fetchCoolWaterPoint,
	queryEnergyPoint
} from '@/api/intelligentMonitor/index';
import {
	queryNoticeByPro
} from "@/api/paramsMonitor/index";
import {
	energy
} from './interface';
import {
	_filter,
	_sortBy
} from '@/utils/lodash';
import {
	ElMessage
} from 'element-plus'
import notice from '@/utils/notice';
import global from '@/utils/global';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			fix,
			formatDate
		}: any = global();
		const {
			doParams,
			setExtend,
			getParamsStr
		}: any = notice();
		const obj: energy = {
			active: 'energy',
			list: [{
				name: '能耗',
				key: 'energy',
				pointList: [],
				point: '',
				data: [],
				time: [proxy.$root.$moment().startOf('day').format('x') - 86400000 * 30, proxy.$root.$moment().startOf('day').format('x') - 86400000],
				openNotice: false
			}, {
				name: '水耗',
				key: 'water',
				pointList: [],
				point: '',
				data: [],
				time: [proxy.$root.$moment().startOf('day').format('x') - 86400000 * 30, proxy.$root.$moment().startOf('day').format('x') - 86400000],
				openNotice: false
			}],
		};
		const pageData = reactive(obj);
		watch(() => pageData.active, (nv, ov) => {
			getNoticeAndChartFun();
		});
		const getCurrent = () => {
			return _filter(pageData.list, (l: any) => l.key === pageData.active)[0];
		};
		const searchAction = () => {
			getNoticeAndChartFun();
		};
		const getNoticeAndChartFun = () => {
			const item: any = getCurrent();
			if (!item.openNotice) return pageData.active == 'energy' ? queryEnergyData(item) : queryWaterData(item);
			var params = doParams(JSON.parse(item.point).pointCode);
			Promise.all([pageData.active == 'energy' ? modifiedEnergyConsumptionStatistic({
				...JSON.parse(item.point),
				endDateTime: item.time[1],
				startDateTime: item.time[0],
				projectCode: state.common.currentProject.projectId
			}) : modifiedWaterConsumptionStatistic({
				...JSON.parse(getCurrent().point),
				endDateTime: Number(item.time[1]),
				startDateTime: Number(item.time[0]),
				projectCode: state.common.currentProject.projectId
			}), queryNoticeByPro({
				...params.requestParams,
				startTime: Number(item.time[0]),
				endTime: Number(item.time[1])
			})]).then((res: any) => {
				item.data = _sortBy(res[0].data.data, 'timestamp');
				const extend = setExtend(_sortBy(res[0].data.data, 'timestamp'), res[1].data.data[getParamsStr(params)], 'day');
				drawLine(_sortBy(res[0].data.data, 'timestamp'), extend)
			})
		};
		const queryEnergy = () => {
			queryEnergyPoint(state.common.currentProject.projectUuid).then((res: any) => {
				pageData.list.forEach((item: any) => {
					if (item.key === 'energy') {
						item.pointList = res.data.data.map((e: any) => {
							e.pointCode = e.propCode;
							return e
						});
						item.point = JSON.stringify(item.pointList[0]);
						queryEnergyData(item);

					}
				});
			})
		};
		const queryWater = () => {
			fetchCoolWaterPoint(state.common.currentProject.projectUuid).then((res: any) => {
				pageData.list.forEach((item: any) => {
					if (item.key === 'water') item.pointList = res.data.data.map((e: any) => {
						e.pointCode = e.propCode;
						return e
					});
					item.point = JSON.stringify(item.pointList[0]);
				})
			})
		};
		const queryEnergyData = async (item: any) => {
			if (item.pointList.length == 0) return ElMessage.warning('暂无数据');
			await nextTick();
			modifiedEnergyConsumptionStatistic({
				...JSON.parse(item.point),
				endDateTime: item.time[1],
				startDateTime: item.time[0],
				projectCode: state.common.currentProject.projectId
			}).then((res: any) => {
				item.data = _sortBy(res.data.data, 'timestamp');
				// pageData.list[0].data = _sortBy(res.data.data, 'timestamp');
				drawLine(_sortBy(res.data.data, 'timestamp'))
			});
		};
		const queryWaterData = async (item: any) => {
			if (item.pointList.length == 0) return ElMessage.warning('暂无数据');
			await nextTick();
			modifiedWaterConsumptionStatistic({
				...JSON.parse(item.point),
				endDateTime: item.time[1],
				startDateTime: item.time[0],
				projectCode: state.common.currentProject.projectId
			}).then((res: any) => {
				item.data = _sortBy(res.data.data, 'timestamp');
				// pageData.list[0].data = _sortBy(res.data.data, 'timestamp');
				drawLine(_sortBy(res.data.data, 'timestamp'))
			});
		};
		const drawLine = (list: any, extend: any = {
			series: {},
			tooltip: {}
		}) => {
			const {
				series,
				tooltip
			}: any = extend;
			const name = pageData.active === 'energy' ? '能耗kWh' : '水耗m³';
			const chart = proxy.$root.$echarts.init(document.getElementById(pageData.active));
			chart.clear();
			chart.setOption({
				color: pageData.active === 'energy' ? ['#07c160'] : ['#09e'],
				tooltip: {
					trigger: 'axis',
					...tooltip
				},
				legend: {
					data: [name],
				},
				grid: {
					containLabel: false,
					left: '5%',
					right: '5%'
				},
				xAxis: {
					type: 'category',
					data: list.map((item: any) => proxy.$root.$moment(item.timestamp).format('YYYY-MM-DD')),
					boundaryGap: ['5%', '5%']
				},
				yAxis: {
					type: 'value',
					name: name
				},
				series: [{
					name: name,
					data: list.map((item: any) => pageData.active === 'energy' ? item.energyConsumption : item.waterConsumption),
					type: 'bar',
					...series
				}]
			})
		};
		onMounted(() => {
			queryEnergy();
			queryWater();
		})
		return {
			...toRefs(pageData),
			searchAction,
			getNoticeAndChartFun,
			formatDate,
			fix
		}
	}
})
</script>
