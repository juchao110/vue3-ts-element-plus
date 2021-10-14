<template>
<el-dialog title="重要通知" center v-model="dialog" width="80%">
	<el-table :data="list" stripe>
		<el-table-column type="index" label="#" align="center" />
		<el-table-column prop="noticeTypeName" label="通知类型" align="center">
			<template #default="scope">
				{{ scope.row.noticeTypeName }}
				<span v-if="scope.row.noticeType == 3"> ({{ scope.row.proSysName }})</span>
				<span v-if="scope.row.noticeType == 4"> ({{ scope.row.roomName }})</span>
			</template>
		</el-table-column>
		<el-table-column prop="startTime" label="开始时间" align="center">
			<template #default="scope">
				{{ formatDate(scope.row.startTime)}}
			</template>
		</el-table-column>
		<el-table-column prop="solveTime" label="恢复时间" align="center">
			<template #default="scope">
				<span v-if="!!scope.row.solveTime">{{ formatDate(scope.row.solveTime) }}</span>
				<span v-else-if="scope.row.ensureState == 1">恢复时间待确认</span>
				<span v-else-if="scope.row.rentState == 1">招租中</span>
			</template>
		</el-table-column>
		<el-table-column prop="content" label="通知内容" align="center" />
		<el-table-column prop="createByName" label="创建人" align="center" />
		<el-table-column prop="updateByName" label="上次提交人" align="center" />
	</el-table>
</el-dialog>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted
} from 'vue';
import {
	useStore
} from 'vuex';
import global from '@/utils/global';
import {
	queryNoticeByPro
} from '@/api/intelligentMonitor/index';
import notice from '@/utils/notice';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			formatDate
		}: any = global();
		const {
			doParams,
			getParamsStr
		}: any = notice();
		const pageData = reactive({
			list: [],
			dialog: false,
		});
		const showAction = (row: any) => {
			var params = doParams(row.pointCode);
			queryNoticeByPro({
				...params.requestParams,
				startTime: row.beginTime,
				endTime: row.endTime
			}).then((res: any) => {
				pageData.list = res.data.data[getParamsStr(params)];
				pageData.dialog = true;
			})
		}
		return {
			...toRefs(pageData),
			formatDate,
			showAction
		}
	}
})
</script>
