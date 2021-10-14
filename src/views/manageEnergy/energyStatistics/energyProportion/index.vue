<template>
<div class="energy-proportion-page">
	<el-tabs type="border-card" v-model="activeName" @tab-click="tabChange">
		<el-tab-pane :label="tab.name" :name="tab.dayType" v-for="(tab,index) in tabList" :key="index">
			<div class="search">
				<el-date-picker v-model="tab.time" :type="activeName=='day'?'date':'month'" value-format="x" class="mg-r-20">
				</el-date-picker>
				<el-button type="primary" class="mg-r-20" @click="coolEnergyPercentStatisticFun">搜索</el-button>
				<Csv :dataList="tab.getExportList" :fileName="state.common.currentProject.projectName" :header="tab.getExportHead"></Csv>
			</div>
			<Echart :ref="tab.dayType" :options="tab.options" :height="400"></Echart>
			<el-table :data="tab.tableData" show-summary stripe border style="width: 60%;margin:0 auto">
				<el-table-column prop="system" label="电表名" align="center">
				</el-table-column>
				<el-table-column label="能耗（kWh）" prop="value" align="center">
				</el-table-column>
			</el-table>
		</el-tab-pane>
	</el-tabs>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	nextTick,
	getCurrentInstance
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	coolEnergyPercentStatistic
} from '@/api/manageEnergy/index';
import {
	_filter
} from '@/utils/lodash';
import {
	energyProportion
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
			fix
		}: any = global();
		const obj: energyProportion = {
			tabList: [],
			activeName: 'day'
		};
		const pageData = reactive(obj);
		pageData.tabList.push({
			dayType: 'day',
			name: '日能耗',
			time: new Date().getTime() - 86400000,
			tableData: [],
			getExportList: [],
			getExportHead: []
		}, {
			dayType: 'month',
			name: '月能耗',
			time: proxy.$root.$moment().startOf('month').valueOf(),
			tableData: [],
			getExportList: [],
			getExportHead: []
		});
		const getCurrent = () => {
			return _filter(pageData.tabList, (o: any) => o.dayType == pageData.activeName)[0];
		};
		const coolEnergyPercentStatisticFun = async () => {
			await nextTick();
			coolEnergyPercentStatistic({
				coolNum: state.common.currentProject.projectId,
				dateTime: getCurrent().time,
				type: getCurrent().dayType
			}).then((res: any) => {
				getCurrent().total = res.data.data.total;
				getCurrent().tableData = res.data.data.data.map((e: any) => {
					e.value = fix(e.value);
					return e
				});
				getCurrent().getExportList = getCurrent().tableData.map((e: any) => {
					return {
						日期: proxy.$root.$moment(e.dateTime).format("YYYY-MM-DD"),
						电表名: e.system,
						能耗值: e.value
					}
				});
				getCurrent().getExportHead = ["日期", "电表名", "能耗值"];
				const list = res.data.data.data;
				if (list.length == 0) {
					getCurrent().options = {};
					return false;
				}
				getCurrent().options = {
					tooltip: {
						trigger: 'item',
						formatter: '{a} <br/>{b} : {c} ({d}%)'
					},
					legend: {
						type: 'scroll',
						orient: 'vertical',
						right: 10,
						top: 20,
						bottom: 20,
					},
					series: [{
						name: "能耗",
						type: "pie",
						radius: list.length > 50 ? "25%" : list.length > 30 ? '40%' : '50%',
						center: ["40%", "50%"],
						data: list.map((e: any) => {
							return {
								name: e.system,
								value: fix(e.value)
							}
						})
					}]
				}
			});
		};
		const tabChange = () => {
			if (getCurrent().tableData.length == 0) coolEnergyPercentStatisticFun();
		};
		onMounted(() => {
			coolEnergyPercentStatisticFun();
		})
		return {
			...toRefs(pageData),
			coolEnergyPercentStatisticFun,
			fix,
			tabChange,
			state
		}
	}
})
</script>
