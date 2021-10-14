<template>
<div class="edit-params-page">
	<div class="top-select mg-b-20">
		<el-input v-model="searchWord" class="width-200 mg-r-20" placeholder="请输入关键字" clearable></el-input>
		<el-button type="primary" @click="handleSearch">搜索</el-button>
	</div>
	<div class="clearfloat">
		<div class="left-tree l">
			<SystemTree :treeData="treeData" @checked="getTreeRes" v-if="treeData"></SystemTree>
		</div>
		<div class="right-list l">
			<el-table :data="pointList.results" stripe fit highlight-current-row height="90%">
				<el-table-column type="index" align="center" label="序号">
				</el-table-column>
				<el-table-column align="center" prop="deviceName" label="设备名称">
					<template #default="scope">
						<div>{{ scope.row.deviceName }}</div>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="propName" label="属性点名">
					<template #default="scope">
						<div>
							{{ scope.row.remark ? scope.row.remark : scope.row.propName }}
						</div>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="value" label="当前设定值">
					<template #default="scope">
						<div>{{ scope.row.value }}</div>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="propUnit" label="单位">
					<template #default="scope">
						<div>{{ scope.row.propUnit }}</div>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="enable" sortable label="是否开启">
					<template #default="scope">
						<el-tag :type="scope.row.enable == 1 ? 'success' : 'danger'">{{
                getEnable(scope.row.enable)
              }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="remark" label="备注">
					<template #default="scope">
						<div>{{ scope.row.remark }}</div>
					</template>
				</el-table-column>
				<el-table-column align="center" prop="" label="操作">
					<template #default="scope">
						<div>
							<el-button type="primary" size="small" :disabled="!currentProjectAction.isRemoteControl" @click="edit(scope.row)">修改</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-box">
				<el-pagination @current-change="handleCurrentChange" v-model:currentPage="currentPage" :page-size="20" layout="prev, pager, next, jumper" :total="pointList.totalRecord" background>
				</el-pagination>
			</div>
		</div>
		<el-dialog title="远程控制" v-model="dialogVisible" width="30%" :before-close="handleClose">
			<div class="row-div">
				<el-row>
					<el-col :span="6" class="align-right">设备名称：</el-col>
					<el-col :span="18">{{ currentPoint.deviceName }}</el-col>
				</el-row>
			</div>
			<div class="row-div" v-if="currentPoint.remark">
				<el-row>
					<el-col :span="6" class="align-right">备注：</el-col>
					<el-col :span="18">{{ currentPoint.remark }}</el-col>
				</el-row>
			</div>
			<div class="row-div" v-else>
				<el-row>
					<el-col :span="6" class="align-right">属性点名：</el-col>
					<el-col :span="18">{{ currentPoint.propName }}</el-col>
				</el-row>
			</div>
			<div class="row-div">
				<el-row>
					<el-col :span="6" class="align-right">单位：</el-col>
					<el-col :span="18">{{ currentPoint.propUnit }}</el-col>
				</el-row>
			</div>
			<div class="row-div">
				<el-row>
					<el-col :span="6" class="align-right">当前值：</el-col>
					<el-col :span="18">{{ currentPoint.value }}</el-col>
				</el-row>
			</div>
			<div class="row-div">
				<el-row>
					<el-col :span="6" class="align-right">修改值：</el-col>
					<el-col :span="18">
						<el-input v-model="changeValue" class="width-200" clearable></el-input>
					</el-col>
				</el-row>
			</div>
			<div class="foot-btn">
				<el-button @click="handleClose">取 消</el-button>
				<el-button type="primary" @click="submitValue">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</div>
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
	editParams
} from '../interface';
import {
	getProjectTreeByProUuid,
	querySetPoints,
	writeVariable
} from '@/api/paramsMonitor/index';
import {
	_difference
} from "@/utils/lodash";
import {
	ElMessage
} from 'element-plus';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const currentProjectAction = computed(() => state.common.currentProject);
		const obj: editParams = {
			searchWord: '',
			treeData: [],
			pointList: [],
			currentCheckedList: [],
			dialogVisible: false,
			changeValue: '',
			currentPoint: {},
			currentPage: 1
		};
		const pageData = reactive(obj);
		//获取点的列表数据
		const querySetPointsFun = (list: Array < [] > , uuid ? : string) => {
			if (_difference(list, pageData.currentCheckedList).length != 0)
				pageData.currentPage = 1;
			pageData.currentCheckedList = list;
			querySetPoints({
				instanceUuids: list,
				pageNo: pageData.currentPage,
				pageSize: 20,
				projectUuid: uuid ? uuid : state.common.currentProject.projectUuid,
				searchParam: pageData.searchWord,
				isEnable: 1
			}).then((res: any) => {
				pageData.pointList = res.data.data;
			});
		};
		// 获取系统下的参数
		const getProjectTreeByProUuidFun = (uuid: string) => {
			getProjectTreeByProUuid(uuid).then((res: any) => {
				pageData.treeData = res.data.data;
			});
		};
		const getTreeRes = (data: any) => {
			pageData.currentPage = 1;
			querySetPointsFun(data, );
		};
		const handleCurrentChange = (data: any) => {
			pageData.currentPage = data;
			querySetPointsFun(
				pageData.currentCheckedList,
				state.common.currentProject.projectUuid
			);
		};
		const handleSearch = () => {
			querySetPointsFun(
				pageData.currentCheckedList,
				state.common.currentProject.projectUuid
			);
		};
		const edit = (row: any) => {
			pageData.dialogVisible = true;
			pageData.currentPoint = row;
		};
		const getEnable = (value: string | number) => {
			if (value == 0) return "未开启";
			else return "已开启";
		};
		const submitValue = () => {
			if (!pageData.changeValue) return ElMessage.error("请输入修改值");
			writeVariable({
				uuid: pageData.currentPoint['uuid'],
				value: pageData.changeValue
			}).then((res: any) => {
				if (res.data.code == 0) {
					ElMessage.success("修改成功");
					pageData.changeValue = "";
					pageData.dialogVisible = false;
					handleSearch();
				}
			});
		};
		const handleClose = () => {
			pageData.changeValue = "";
			pageData.dialogVisible = false;
		};
		onMounted(() => {
			getProjectTreeByProUuidFun(state.common.currentProject.projectUuid);
			querySetPointsFun(pageData.currentCheckedList, state.common.currentProject.projectUuid);
		})
		return {
			...toRefs(pageData),
			currentProjectAction,
			getTreeRes,
			handleCurrentChange,
			handleSearch,
			handleClose,
			edit,
			getEnable,
			submitValue
		}
	}
})
</script>
