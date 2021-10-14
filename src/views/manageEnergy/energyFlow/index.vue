<template>
<div class="energy-flow-page">
	<div class="timer mg-b-20">
		时间类型：
		<el-select v-model="dayType" placeholder="请选择" class="mg-r-20">
			<el-option label="日" value="day"> </el-option>
			<el-option label="月" value="month"> </el-option>
		</el-select>
		时间：
		<el-date-picker v-model="time" :type="dayType=='day'?'date':'month'" value-format="x" class="mg-r-20">
		</el-date-picker>
		<el-button type="primary" class="mg-r-20" @click="queryEnergyManagementFun">搜索</el-button>
	</div>
	<div class="content">
		<Echart :options="options" :height="height"></Echart>
		<el-table :data="tableData" border :tree-props="{children: 'data'}" row-key="id" style="width: 100%; margin-top: 20px">
			<el-table-column prop="columnName" label="名称">
			</el-table-column>
			<el-table-column prop="value" label="能耗（kWh）">
				<template #default="scope">
					<span>{{ fix(scope.row.value) }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="percent" label="占比">
				<template #default="scope">
					<span>{{ fix(scope.row.percent) }}%</span>
				</template>
			</el-table-column>
		</el-table>
	</div>
</div>
</template>
<script lang='ts'>
import {
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
	queryEnergyManagement
} from '@/api/manageEnergy/index';
import {
	energyFlow
} from '../interface';
import {
	_uniqBy,
	_sumBy
} from '@/utils/lodash';
import global from '@/utils/global';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			getRandomColor,
			fix
		}: any = global();
		const obj: energyFlow = {
			time: new Date().getTime() - 86400000,
			dayType: 'day',
			options: {},
			tableData: []
		};
		const pageData = reactive(obj);
		const height = ref(0);
		const queryEnergyManagementFun = async () => {
			await nextTick();
			pageData.tableData = [];
			pageData.options = {};
			queryEnergyManagement({
				SYSTEM_PERCENT: {
					dayType: pageData.dayType,
					projectId: state.common.currentProject.projectId,
					startTimestamp: pageData.time
				}
			}).then((res: any) => {
				let length: number = 0;
				if (res.data.data.SYSTEM_PERCENT) {
					const total = _sumBy(res.data.data.SYSTEM_PERCENT[0].data, 'value');
					pageData.tableData = res.data.data.SYSTEM_PERCENT[0].data.map((item: any) => {
						item.columnName = item.system;
						item.percent = item.value / total * 100;
						item.id = Math.random();
						length += item.data.length;
						item.data.forEach((e: any) => {
							e.columnName = e.insPropName;
							e.id = Math.random();
						})
						return item
					});
					doOptions(res.data.data.SYSTEM_PERCENT[0]);
					height.value = length * 40;
				}
			})
		};
		const doOptions = (dataList: any) => {
			let data: any = [],
				links: any = [];
			dataList.data.forEach((e: any) => {
				let {
					system,
					value
				} = e;
				links.push({
					source: dataList.system,
					target: system,
					value: value,
				})
				data.push({
					name: dataList.system,
					itemStyle: {
						color: getRandomColor()
					}
				})
				e.data.forEach((child: any) => {
					let {
						insPropName,
						value
					} = child;
					links.push({
						source: system,
						target: insPropName,
						value: value,
						// lineStyle: {
						// 	color: this.getRandomColor()
						// }
					})
					data.push({
						name: insPropName,
						itemStyle: {
							color: getRandomColor()
						}
					})
				})
				data.push({
					name: system,
					itemStyle: {
						color: getRandomColor()
					}
				})
			})

			pageData.options = {
				tooltip: {
					trigger: 'item',
					triggerOn: 'mousemove'
				},
				series: {
					type: 'sankey',
					layout: 'none',
					emphasis: {
						focus: 'adjacency'
					},
					// orient: 'vertical',
					nodeWidth: 10,
					right: 250,
					label: {
						color: 'rgba(0,0,0,0.7)',
						fontFamily: 'Arial',
						fontSize: 14
					},
					data: _uniqBy(data, 'name'),
					links: links
				}
			};
		};
		onMounted(() => {
			queryEnergyManagementFun();
		})
		return {
			...toRefs(pageData),
			fix,
			queryEnergyManagementFun,
			height
		}
	}
})
</script>
