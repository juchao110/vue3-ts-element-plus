<template>
<div class="data-query-page">
	<el-form :model="form" ref="formRef" label-width="100px">
		<el-row :gutter="20">
			<el-col :span="6">
				<el-form-item label="监控组" prop="systemGroup">
					<el-select v-model="form.systemGroup" @change="handleSystemGroup" clearable>
						<el-option v-for="i in systemGroupList" :label="i.monitorGroupName" :key="i.monitorGroupId" :value="i.monitorGroupId"></el-option>
					</el-select>
				</el-form-item>
			</el-col>
			<el-col :span="6">
				<el-form-item label="测点名" prop="points">
					<el-select v-model="form.points" multiple collapse-tags filterable clearable>
						<el-option-group v-for="group in pointList" :key="group.metric" :label="group.metric">
							<el-option v-for="item in group.metricDatas" :key="JSON.stringify(item.monitorData)" :label="item.monitorData.pointName" :value="JSON.stringify(item.monitorData)">
							</el-option>
						</el-option-group>
					</el-select>
				</el-form-item>
			</el-col>
			<el-col :span="12">
				<el-form-item label="时间范围" prop="time">
					<el-date-picker v-model="form.time" type="datetimerange" @calendar-change="calendarChange" :disabledDate="pickerOptions" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
					</el-date-picker>
				</el-form-item>
			</el-col>
		</el-row>
		<el-row class="mg-b-20">
			<el-col :span="6">
				<el-form-item label="间隔" prop="interval">
					<el-select v-model="form.interval" clearable>
						<el-option v-for="i in intervalList" :label="i.label" :key="i.id" :value="i.id"></el-option>
					</el-select>
				</el-form-item>
			</el-col>
			<el-col :span="12" :offset="2">
				<el-button class="l" type="primary" @click="search">搜索</el-button>
				<el-button class="l mg-r-20" type="info" @click="reset">重置</el-button>
				<!-- <el-button type="success" @click="exportByFront" :disabled="isSearched">导出数据</el-button> -->
				<Csv class="l" :dataList="downloadList" :fileName="fileName" :header="header"></Csv>
			</el-col>
		</el-row>
	</el-form>
	<el-tabs v-model="activeName" @tab-click="handleClick">
		<el-tab-pane :label="p.propName" :name="p.pointCode" v-for="(p, index) in tabList" :key="index">
			<div class="data-list">
				<el-table :data="p.datas" style="width: 100%">
					<el-table-column type="index" :label="
            `条数(共${
              p.datas ? p.datas.length : 0
            }条)`
          " align="center" width="200">
					</el-table-column>
					<el-table-column label="测点名" align="center">
						<template #default="scope">
							<span>{{ scope.row.pointName }}</span>
						</template>
					</el-table-column>
					<el-table-column label="时间" align="center">
						<template #default="scope">
							<span>{{ formatDate(scope.row.dateTime) }}</span>
						</template>
					</el-table-column>
					<el-table-column label="当前值" align="center">
						<template #default="scope">
							<span>{{ fix(Number(scope.row.value)) }}</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
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
	getCurrentInstance,
	ref,
	computed
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	dataQuery,
	form
} from './interface';
import {
	queryGroups,
	queryGroupsMetricData,
	trendAnalysisWithoutCompress
} from '@/api/intelligentMonitor/index';
import global from '@/utils/global';
import {
	ElMessage
} from 'element-plus';
import {
	_filter,
	_groupBy
} from '@/utils/lodash';
// var excelModule = require("@/vendor/Export2Excel");
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const formData: form = {
			systemGroup: '',
			points: [],
			time: [],
			interval: '',
			pointsList: [],
			currentSelect: 0
		};
		const formRef: any = ref(null);
		const form = reactive(formData);
		const obj: dataQuery = {
			activeName: "",
			systemGroupList: [],
			pointList: [],
			tabList: [],
			isSearched: true,
			header: [],
			exportList: [],
			downloadList: [],
			intervalList: [{
					id: 0,
					label: "无"
				}, {
					id: 30,
					label: "30秒"
				},
				{
					id: 60,
					label: "1分钟"
				},
				{
					id: 300,
					label: "5分钟"
				},
				{
					id: 1800,
					label: "30分钟"
				},
				{
					id: 3600,
					label: "60分钟"
				}
			]
		};
		const fileName = computed(() => state.common.currentProject.projectName);
		const pageData = reactive(obj);
		const {
			fix,
			formatDate
		}: any = global();
		const queryGroupsFun = () => {
			pageData.systemGroupList = [];
			queryGroups({
				projectId: state.common.currentProject.projectId,
				projectUuid: state.common.currentProject.projectUuid
			}).then((res: any) => {
				pageData.systemGroupList = res.data.data;
			});
		};
		const queryGroupsMetricDataFun = (id: Number) => {
			pageData.pointList = [];
			queryGroupsMetricData({
				from: 1561435200000, //随便传，无影响
				to: 1561478400000, //随便传，无影响
				monitorGroupId: id,
				projectId: state.common.currentProject.projectId,
				projectUuid: state.common.currentProject.projectUuid,
				queryType: 1
			}).then((res: any) => {
				pageData.pointList = res.data.data;
			});
		};
		const handleSystemGroup = (data: Number) => {
			queryGroupsMetricDataFun(data);
		};
		const search = async () => {
			await nextTick();
			if (!form.systemGroup) return ElMessage.error("请选择监控组");
			if (form.points.length == 0)
				return ElMessage.error("请选择测点");
			if (form.time.length == 0) return ElMessage.error("请选择时间");
			form.pointsList = form.points.map((e: any) => JSON.parse(e));
			pageData.exportList = [];
			pageData.isSearched = false;
			pageData.tabList = [];
			form.points.forEach((e: any, index: number) => {
				trendAnalysisWithoutCompressFun({
					interval: form.interval,
					startDateTime: form.time[0],
					endDateTime: form.time[1],
					pointCode: JSON.parse(e).pointCode,
					metric: JSON.parse(e).metric,
					propName: JSON.parse(e).pointName
				});
			});
			pageData.activeName = form.points.length != 0 ? JSON.parse(form.points[0]).pointCode : '';
		};
		const trendAnalysisWithoutCompressFun = (point: any) => {
			trendAnalysisWithoutCompress([point]).then((res: any) => {
				pageData.exportList = [
					...pageData.exportList,
					...res.data.data.map((e: any) => {
						return {
							dateTime: e.dateTime,
							propCode: e.propCode,
							value: Math.floor(e.value) == e.value ? e.value : e.value.toFixed(2),
							pointName: point.propName
						};
					})
				];
				if (form.pointsList) pageData.header = ["日期", ...form.pointsList.map((e: any) => e.pointName)];
				const groupList = _groupBy(
					pageData.exportList.map((e: any) => {
						let obj: any = {};
						obj.dateTime = e.dateTime;
						obj[e.pointName] = e.value;
						obj["日期"] = proxy.$root.$moment(e.dateTime).format(
							"YYYY-MM-DD HH:mm:ss"
						);
						return obj;
					}),
					"dateTime"
				);
				pageData.downloadList = Object.keys(groupList).map((k: any) => {
					let obj = {};
					groupList[k].forEach((e: any) => {
						obj = Object.assign(obj, e);
					});
					return obj;
				});
				pageData.tabList.push({
					...point,
					datas: res.data.data.map((e: any) => {
						return {
							...e,
							value: parseInt(e.value) == e.value ? e.value : e.value.toFixed(2),
							pointName: point.propName
						};
					})
				})
			});
		};
		const reset = async () => {
			await nextTick()
			formRef.value.resetFields();
		};
		// const exportByFront = () => {
		// 	const groupList = _groupBy(
		// 		pageData.exportList.map((e: any) => {
		// 			let obj: any = {};
		// 			obj.dateTime = e.dateTime;
		// 			obj[e.propCode] = e.value;
		// 			return obj;
		// 		}),
		// 		"dateTime"
		// 	);
		// 	const list = Object.keys(groupList).map((k: any) => {
		// 		let obj = {};
		// 		groupList[k].forEach((e: any) => {
		// 			obj = Object.assign(obj, e);
		// 		});
		// 		return obj;
		// 	});
		// 	console.log(excelModule, 'excelModuleexcelModule')
		// 	const tHeader = ["时间", ...form.pointsList.map((e: any) => e.pointName)];
		// 	const filterVal = [
		// 		"dateTime",
		// 		...form.pointsList.map((e: any) => e.pointCode)
		// 	];
		// 	const data = formatJson(filterVal, list);
		// 	excelModule.export_json_to_excel({
		// 		header: tHeader,
		// 		data,
		// 		filename: state.common.currentProject.projectName,
		// 		autoWidth: true
		// 	});
		// };
		const formatJson = (filterVal: Array < any > , jsonData: Array < any > ) => {
			return jsonData.map((v) =>
				filterVal.map(j => {
					if (j == "dateTime") {
						return proxy.$root.$moment(v[j]).format("YYYY-MM-DD HH:mm:ss");
					} else {
						return v[j];
					}
				})
			);
		};
		const pickerOptions = (date: any) => {
			// console.log(data)
			if (pageData.currentSelect == 0) return false;
			if (date.getTime() > (pageData.currentSelect + 86400000 * 30) || date.getTime() < (pageData.currentSelect - 86400000 * 30)) return true
			else return false;
		};
		const calendarChange = (date: Array < any > ) => {
			pageData.currentSelect = date[0] ? date[0].getTime() : 0
		};
		onMounted(() => {

		})
		queryGroupsFun();
		return {
			...toRefs(pageData),
			form,
			handleSystemGroup,
			fix,
			formatDate,
			formRef,
			search,
			reset,
			// exportByFront,
			fileName,
			pickerOptions,
			calendarChange
		}
	}
})
</script>
