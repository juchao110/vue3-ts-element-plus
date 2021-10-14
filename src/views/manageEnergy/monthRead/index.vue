<template>
<div class="month-read-page">
	<div class="search mg-b-40">
		能耗类型
		<el-select v-model="type" placeholder="请选择能耗类型" class="mg-r-20">
			<el-option :label="t.text" v-for="(t,index) in typeOptions" :value="t.value" :key="index"></el-option>
		</el-select>
		分摊类型
		<el-select v-model="method" placeholder="请选择分摊类型" class="mg-r-20">
			<el-option :label="t.text" v-for="(t,index) in methodOptions" :value="t.value" :key="index"></el-option>
		</el-select>每月开始日期
		<el-select v-model="day" placeholder="请选择每月开始日期" class="mg-r-20">
			<el-option :label="t.text" v-for="(t,index) in dayOption" :value="t.value" :key="index"></el-option>
		</el-select>
		<el-date-picker v-model="time" type="monthrange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mg-r-20">
		</el-date-picker>
		<el-button type="primary" @click="queryEnergyManagementFun">查询</el-button>
	</div>
	<el-tabs type="border-card" v-model="activeName" @tab-click="tabChange">
		<el-tab-pane :label="tab.name" :name="tab.name" v-for="(tab,index) in list" :key="index">
			<div class="each-item mg-b-20" v-for="(item,iindex) in tab.list" :key="iindex">
				<el-row>
					<el-col :span="12">
						<Echart :options="item.options" v-if="activeName==tab.name"></Echart>
					</el-col>
					<el-col :span="12">
						<el-table :data="item.datas" border style="width: 100%">
							<el-table-column prop="日期" label="日期" align="center">
							</el-table-column>
							<el-table-column :prop="item.type" :label="item.type" align="center">
							</el-table-column>
							<el-table-column prop="峰时" label="峰时" align="center">
							</el-table-column>
							<el-table-column prop="谷时" label="谷时" align="center">
							</el-table-column>
							<el-table-column prop="平时" label="平时" align="center">
							</el-table-column>
						</el-table>
					</el-col>
				</el-row>
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
	onMounted
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	queryEnergyManagement
} from '@/api/manageEnergy/index';
import {
	_groupBy,
	_sortBy,
	_filter
} from '@/utils/lodash';
import global from '@/utils/global';
import {
	monthRead
} from '../interface';
export default defineComponent({
	setup() {
		const typeOptions = [{
			text: "总能耗",
			value: "PROJECT_ELECTRIC_HOUR_FEE"
		}, {
			text: "温区能耗",
			value: "SYSTEM_ELECTRIC_HOUR_FEE"
		}, {
			text: "冷间能耗",
			value: "ROOM_ELECTRIC_HOUR_FEE"
		}];
		const methodOptions = [{
			text: '按冷间面积分摊',
			value: 'area'
		}, {
			text: '按运行时长分摊',
			value: 'duration'
		}];
		const dayOption = Array(15).fill(0).map((e: any, index: number) => {
			return {
				text: index + 1 + '号',
				value: index + 1
			}
		});
		const each = [{
			name: '能耗',
			key: 1,
		}, {
			name: '电费',
			key: 2,
		}];
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			fix
		}: any = global();
		const store = useStore();
		const state = store.state;
		const obj: monthRead = {
			type: 'PROJECT_ELECTRIC_HOUR_FEE',
			method: 'area',
			day: 1,
			dayType: 'month',
			time: [proxy.$root.$moment().startOf('year').valueOf(), proxy.$root.$moment().startOf('month').valueOf()],
			list: [],
			activeName: ''
		};
		const pageData = reactive(obj);
		const queryEnergyManagementFun = () => {
			let params: any = {};
			params.startTimestamp = Math.floor(pageData.time[0]) + 86400000 * (pageData.day - 1);
			params.endTimestamp = Math.floor(pageData.time[1]) + 86400000 * (pageData.day - 2);
			params.type = pageData.type;
			params.day = pageData.day;
			params.method = pageData.method;
			params.dayType = pageData.dayType;
			params.projectId = state.common.currentProject.projectId;
			let obj: any = {};
			obj[pageData.type] = params;
			queryEnergyManagement(obj).then((res: any) => {
				const list = Object.keys(res.data.data).flatMap((e: any) => {
					return res.data.data[e]
				})
				if (list.length == 0) return false;
				const group = _groupBy(_sortBy(list[0].energyFeeData, 'timestamp'), 'insPropName');
				pageData.list = Object.keys(group).map((k: any) => {
					return {
						name: k,
						list: each.map((item: any) => {
							if (item.key == 1) return {
								type: item.name,
								datas: handleData(group[k], 'value'),
								options: handleChartData(group[k], item.name)
							}
							else return {
								type: item.name,
								datas: handleData(group[k], 'feeValue'),
								options: handleChartData(group[k], item.name)
							}
						})
					}
				});
				pageData.activeName = pageData.list[0].name;
			})
		};
		const handleData = (data: any, key: string) => {
			const dateList = _groupBy(_sortBy(data, 'timestamp'), 'timestamp');
			return Object.keys(dateList).map((d: string) => {
				return {
					日期: proxy.$root.$moment(parseInt(d)).format('YYYY-MM'),
					...Object.assign({}, ...dateList[d].map((k: any) => {
						let obj: any = {};
						obj[k.feeType] = Math.floor(k[key]) == k[key] ? k[key] : k[key] ? k[key].toFixed(2) : k[key];
						obj['电费'] = k.feeTotalValue ? k.feeTotalValue.toFixed(2) : k.feeTotalValue == null ? '-' : k.feeTotalValue;
						return obj
					}))
				}
			})
		};
		const handleChartData = (data: any, key: string) => {
			const dateList = _groupBy(_sortBy(data, 'timestamp'), 'timestamp');
			return {
				legend: {
					data: [key, '峰时', '谷时', '平时']
				},
				tooltip: {
					trigger: 'axis'
				},
				xAxis: {
					type: 'category',
					data: Object.keys(dateList).map((time: any) => proxy.$root.$moment(Math.floor(time)).format('YYYY-MM'))
				},
				yAxis: {
					type: 'value',
					name: key
				},
				series: [{
						name: key,
						type: 'bar',
						barMaxWidth: 20,
						data: Object.keys(dateList).map((time: any) => {
							const n = _filter(dateList[time], (o: any) => o.feeType == '能耗');
							if (n.length == 0) return '-';
							else return key == '电费' ? fix(n[0].feeValue) : fix(n[0].value);
						})
					},
					...['峰时', '谷时', '平时'].map((type: any) => {
						return {
							name: type,
							type: 'bar',
							stack: '峰谷平',
							barMaxWidth: 20,
							data: Object.keys(dateList).map((time: any) => {
								const n = _filter(dateList[time], (o: any) => o.feeType == type);
								if (n.length == 0) return '-';
								else return key == '电费' ? fix(n[0].feeValue) : fix(n[0].value);
							})
						}
					})
				]
			}
		};
		onMounted(() => {
			queryEnergyManagementFun();
		});
		return {
			...toRefs(pageData),
			typeOptions,
			methodOptions,
			dayOption,
			queryEnergyManagementFun,
			each,
		}
	}
})
</script>
