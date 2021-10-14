<template>
<div class="all-params-page">
	<div class="top-select mg-b-20">
		<el-input class="width-200 mg-r-20" v-model="query.insPropname" clearable placeholder="实例点名称" @change="handleSearch()" @clear="handleSearch()" />
		<el-select v-model="query.propDatatype" placeholder="实例点类型" clearable @change="handleSearch()" @clear="handleSearch()">
			<el-option v-for="item in optionsInstanceProp" :key="item.dictCode" :label="item.dictName" :value="item.dictCode" />
		</el-select>
		<el-button type="primary" @click="handleSearch">搜索</el-button>
	</div>
	<div class="clearfloat">
		<div class="left-tree l">
			<SystemTree :needProjectUuid="true" :treeData="treeData" @checked="getTreeRes" v-if="treeData"></SystemTree>
		</div>
		<div class="right-list l">
			<el-table :data="pointList" stripe fit highlight-current-row height="90%" @row-click="rowClick">
				<el-table-column type="index" label="#" prop="id" width="50px" />
				<el-table-column label="实例对象" prop="instanceName" width="400"></el-table-column>
				<el-table-column label="实例点名称" prop="insPropname" width="400"></el-table-column>
				<el-table-column label="实例点类型" prop="propDatatypeName" width="400"></el-table-column>
				<el-table-column label="值" prop="value" width="400"></el-table-column>
				<el-table-column label="单位" prop="unitName" width="400"></el-table-column>
			</el-table>
			<div class="page-box">
				<el-pagination @current-change="handleCurrentChange" v-model:currentPage="query.queryInfo.page" :page-size="query.queryInfo.size" layout="prev, pager, next, jumper" :total="total" background>
				</el-pagination>
			</div>
		</div>
	</div>
	<el-dialog :title="choosed.instanceName" v-model="showTrend" width="60%">
		<Trend :pointCode="choosed.insPropcode" :pointName="choosed.instanceName" :metric="choosed.metric" :alarmConfig="choosed.alarmConfig"></Trend>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="showTrend = false">取 消</el-button>
				<el-button type="primary" @click="showTrend = false">确 定</el-button>
			</span>
		</template>
	</el-dialog>
</div>
</template>
<script lang='ts'>
import {
	getProjectTreeByProUuid,
	allPoint,
	getDict
} from '@/api/paramsMonitor/index';
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
	allParams
} from '../interface';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: allParams = {
			query: {
				enable: 1,
				uuids: [],
				insPropname: null,
				propDatatype: null,
				projectUuid: state.common.currentProject.projectUuid,
				queryInfo: {
					page: 1,
					size: 20,
					orderBy: null
				}
			},
			selectPoint: {},
			optionsInstanceProp: [],
			pointList: [],
			total: 0,
			treeData: [],
			choosed: {},
			showTrend: false
		};
		const pageData = reactive(obj)
		// 获取系统下的参数
		const getProjectTreeByProUuidFun = (uuid: string) => {
			getProjectTreeByProUuid(uuid).then((res: any) => {
				pageData.treeData = res.data.data;
			});
		};
		const getPointsList = () => {
			allPoint(pageData.query).then((res: any) => {
				pageData.pointList = res.data.data.list.map((e: any) => {
					return {
						...e,
						value: e.value ? e.value.toFixed(2) : e.value
					}
				});
				pageData.total = res.data.data.total;
			})
		};
		const getInstancePropAction = () => {
			getDict('T7').then((res: any) => {
				pageData.optionsInstanceProp = res.data.data;
			})
		};
		const getTreeRes = (data: string) => {
			pageData.query.queryInfo.page = 1;
			pageData.query.uuids = data;
			getPointsList();
		};
		const handleSearch = () => {
			pageData.query.queryInfo.page = 1;
			getPointsList();
		};
		const rowClick = (row: any) => {
			pageData.choosed = row;
			pageData.showTrend = true;
		};
		const handleCurrentChange = (data: number) => {
			pageData.query.queryInfo.page = data;
			getPointsList();
		};
		onMounted(() => {
			getInstancePropAction();
			getProjectTreeByProUuidFun(state.common.currentProject.projectUuid);
			getPointsList();
		})
		return {
			...toRefs(pageData),
			getTreeRes,
			handleSearch,
			rowClick,
			handleCurrentChange
		}
	}
})
</script>
