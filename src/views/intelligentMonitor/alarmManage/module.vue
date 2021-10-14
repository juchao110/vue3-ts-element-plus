<template>
<div class="alarm-manage-page">
	<div class="search">
		<el-date-picker v-model="time" type="datetimerange" value-format="x" class="mg-r-20" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
		</el-date-picker>
		<el-select v-model="level" placeholder="请选择报警等级" class="mg-r-20" @change="levelChange">
			<el-option key="all" label="所有报警" value=""></el-option>
			<el-option v-for="item in typeArr" :key="item.value" :label="item.name" :value="item.value">
			</el-option>
		</el-select>
		<el-button type="primary" @click="searchAction('')" class="mg-r-20">搜索</el-button>
		<el-button type="danger" @click="searchAction('all')">查询所有未关闭</el-button>

	</div>
	<div class="alarm-info">
		<div class="alarm-info-item" :class="getEle(a.alarmType,'class')" v-for="(a,index) in alarmDataType" :key="index">
			<p class="name">{{getEle(a.alarmType,'name')}}</p>
			<el-tag :color="getEle(a.alarmType,'style')">{{a.times}}次</el-tag>
			<el-tag :color="getEle(a.alarmType,'style')">{{a.count}}个</el-tag>
			<el-tag :color="getEle(a.alarmType,'style')">{{a.unRecoveredTimes}}待关闭</el-tag>
		</div>
	</div>
	<el-table :data="alarmDataList.results" style="width: 100%">
		<el-table-column type="index" width="50" label="序号" align="center">
		</el-table-column>
		<el-table-column prop="projectName" label="冷库名称" align="center">
		</el-table-column>
		<el-table-column prop="alarmName" label="故障报警" align="center">
		</el-table-column>
		<el-table-column prop="alarmLevel" label="级别" align="center">
			<template #default="scope">
				<div class="">
					<el-tag color="#0b6" v-if="getLevel(scope.row.alarmLevel) == 1"></el-tag>
					<el-tag color="#fd0" v-if="getLevel(scope.row.alarmLevel) == 2"></el-tag>
					<el-tag color="#f00" v-if="getLevel(scope.row.alarmLevel) == 3"></el-tag>
				</div>
			</template>
		</el-table-column>
		<el-table-column prop="beginTime" label="开始时间" align="center">
			<template #default="scope">
				<span>{{ formatDate(scope.row.beginTime) }}</span>
			</template>
		</el-table-column>
		<el-table-column prop="endTime" label="结束时间" align="center">
			<template #default="scope">
				<span>{{ formatDate(scope.row.endTime)  }}</span>
			</template>
		</el-table-column>
		<el-table-column label="应急电话状态" align="center">
			<template #default="scope">
				<span v-if="scope.row.alarmLevel != 'T32-003'">
					-
				</span>
				<el-tag :type="scope.row.isAlarmClosed ? 'danger' : 'success'" v-else>{{ scope.row.isAlarmClosed ? "已关闭" : "已开启" }}</el-tag>
			</template>
		</el-table-column>
		<el-table-column prop="endTime" label="操作" align="center" width="400">
			<template #default="scope">
				<span v-if="scope.row.alarmLevel == 'T32-003'">
					<el-button type="danger" size="small" v-if="scope.row.isAlarmClosed == false" @click="handlePhone('close', scope.row)">关闭应急电话</el-button>
					<el-button type="success" size="small" v-else @click="handlePhone('open', scope.row)">开启应急电话</el-button>
				</span>
				<el-tooltip class="item" effect="dark" content="查看趋势" placement="top">
					<el-button type="text" size="small" @click="showTrendAction(scope.row)"><i class="iconfont font-24">&#xe60b;</i></el-button>
				</el-tooltip>
				<!-- <el-tooltip class="item" effect="dark" content="诊断详情" placement="top">
					<el-button type="text" size="small" @click="showDiagnosed(scope.row)"><i class="iconfont font-20">&#xe6ab;</i></el-button>
				</el-tooltip> -->
				<el-tooltip class="item" effect="dark" content="重要通知" placement="top">
					<el-button :disabled="!scope.row.noticeFlag" type="text" size="small" @click="showNotice(scope.row)"><i class="iconfont font-20">&#xe688;</i></el-button>
				</el-tooltip>
			</template>
		</el-table-column>
	</el-table>
	<div class="page-box">
		<el-pagination background @current-change="handleCurrentChange" v-model:currentPage="currentPage" :page-size="pageSize" layout="total,prev, pager, next, jumper" :total="alarmDataList.totalRecord">
		</el-pagination>
	</div>
	<el-dialog :title="currentRow.alarmName" v-model="showTrend" width="60%">
		<Trend :time="currentRow.time" :pointCode="currentRow.pointCode" :pointName="currentRow.alarmName" :metric="currentRow.metric" :alarmConfig="JSON.parse(currentRow.alarmConfig)"></Trend>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="showTrend = false">取 消</el-button>
				<el-button type="primary" @click="showTrend = false">确 定</el-button>
			</span>
		</template>
	</el-dialog>
	<NoticeList ref="notice"></NoticeList>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	ref,
	onMounted,
	getCurrentInstance,
	nextTick
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	queryDailyAlarms,
	insertAlarmStatus,
	deleteAlarmStatus
} from '@/api/intelligentMonitor/index';
import {
	alarm
} from './interface';
import {
	_sortBy
} from '@/utils/lodash';
import global from '@/utils/global';
import NoticeList from './components/notice.vue';
import {
	ElMessageBox,
	ElMessage
} from 'element-plus';

export default defineComponent({
	components: {
		NoticeList
	},
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			formatDate
		}: any = global();
		const obj: alarm = {
			time: [proxy.$root.$moment().startOf('day').format('x') - 86400000 * 7, proxy.$root.$moment().startOf('day').format('x') - 86400000],
			level: "T32-003",
			typeArr: [{
					value: "T32-003",
					name: "应急报警"
				},
				{
					value: "T32-002",
					name: "一般报警"
				},
				{
					value: "T32-001",
					name: "预警"
				}
			],
			alarmDataType: [],
			alarmDataList: {},
			currentPage: 1,
			pageSize: 20,
			projectId: 0,
			currentRow: {},
			searchAll: "",
			showTrend: false,
			diagnosisParams: {},
		};
		const pageData = reactive(obj);
		const notice: any = ref(null);
		const queryDailyAlarmsFun = (uuid: number, type: string) => {
			queryDailyAlarms({
				from: type ? "" : pageData.time[0],
				pageNo: pageData.currentPage,
				pageSize: pageData.pageSize,
				projectUuid: uuid,
				to: type ? "" : pageData.time[1],
				alarmType: pageData.level
			}).then((res: any) => {
				pageData.alarmDataList = res.data.data.pageInfo;
				pageData.alarmDataType = _sortBy(
					res.data.data.alarmNumber,
					(e: any) => {
						return e.alarmType.substr(e.alarmType.length - 1, 1);
					}
				);
			});
		};
		const levelChange = () => {
			queryDailyAlarmsFun(Math.floor(pageData.projectId), pageData.searchAll);
		};
		const getLevel = (l: string) => {
			return l.substr(6, 1);
		};
		const getEle = (l: any, type: string) => {
			if (l.substr(6, 1) == 3) return type == 'class' ? 'level-3' : type == 'style' ? '#f32' : '应急报警';
			else if (l.substr(6, 1) == 2) return type == 'class' ? 'level-2' : type == 'style' ? '#cec823' : '一般报警';
			else return type == 'class' ? 'level-1' : type == 'style' ? '#0b6' : '预警';
		};
		const searchAction = (type: string) => {
			pageData.searchAll = type;
			pageData.currentPage = 1;
			queryDailyAlarmsFun(Math.floor(pageData.projectId), pageData.searchAll);
		};
		const handleCurrentChange = (data: number) => {
			pageData.currentPage = data;
			queryDailyAlarmsFun(Math.floor(pageData.projectId), pageData.searchAll);
		};
		const showTrendAction = (row: any) => {
			pageData.currentRow = row;
			pageData.currentRow.time = [row.beginTime - 60 * 60 * 1000, row.endTime ?
				row.endTime + 60 * 60 * 1000 : (new Date().getTime() - row.beginTime) / 86400000 > 7 ?
				row.beginTime + 86400000 * 7 : new Date().getTime()
			];
			pageData.showTrend = true;
		};
		const showNotice = async (row: any) => {
			await nextTick();
			notice.value.showAction(row);
		};
		const handlePhone = (s: string, row: any) => {
			if (s == "close")
				ElMessageBox.prompt("请输入关闭原因", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
					inputErrorMessage: "请输入原因"
				})
				.then(({
					value
				}) => {
					insertAlarmStatus({
						alarmId: row.alarmId,
						reason: value
					}).then((res: any) => {
						if (res.data.code == 0) {
							ElMessage.success("成功");
							searchAction(pageData.searchAll);
						}
					});
				})
				.catch(() => {});
			else
				deleteAlarmStatus({
					alarmId: row.alarmId
				}).then((res: any) => {
					if (res.data.code == 0) {
						ElMessage.success("成功");
						searchAction(pageData.searchAll);
					}
				});
		};
		onMounted(() => {
			pageData.projectId = state.common.currentProject.projectUuid;
			queryDailyAlarmsFun(Math.floor(pageData.projectId), pageData.searchAll);
		})
		return {
			...toRefs(pageData),
			levelChange,
			getLevel,
			formatDate,
			getEle,
			searchAction,
			handleCurrentChange,
			showTrendAction,
			notice,
			showNotice,
			handlePhone
		}
	}
})
</script>
<style media="screen" lang="scss">
@import '@/assets/scss/common.scss';
.alarm-manage-page {
    .search {
        @include margin_b(40px);
    }
    .alarm-info {
        display: flex;
        justify-content: center;
        @include margin_b(40px);
        .alarm-info-item {
            @include margin_r(20px);
            @include box_shadow(0,0,5px,$borderColor);
            @include padding(20px);
            @include border_radius(5px);
            p {
                font-size: 18px;
                text-align: center;
                line-height: 35px;
            }
            .el-tag {
                color: $whiteColor;
                font-weight: bold;
                font-size: 16px;
            }
            &.level-1 {
                .name {
                    color: #0b6;
                }
            }
            &.level-2 {
                .name {
                    color: #cec823;
                }
            }
            &.level-3 {
                .name {
                    color: #f32;
                }
            }
        }
    }
    .page-box {
        @include margin_b(40px);
        @include margin_t(40px);
        text-align: right;
    }
}
</style>
