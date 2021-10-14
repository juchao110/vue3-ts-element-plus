<template>
<div>
	<div class="select-box mg-b-20">
		<el-date-picker class="mg-r-20" v-model="params.time" type="monthrange" align="right" value-format="x" start-placeholder="开始月份" end-placeholder="结束月份">
		</el-date-picker>
		<el-button type="primary" @click="getList">查询</el-button>
	</div>
	<div class="table-box table-month-box">
		<div class="table-header">
			<el-button type="text">已选择{{selectionRows.length}}条</el-button>
			<el-button type="text" @click="clearSelect">清除</el-button>
			<el-popover width="50px" placement="bottom" trigger="hover">
				<template #reference>
					<el-button type="text">下载</el-button>
				</template>
				<div>
					<el-button type="text" @click="downLoadAll('pdf')">pdf</el-button>
				</div>
				<div>
					<el-button type="text" @click="downLoadAll('docx')">word</el-button>
				</div>
			</el-popover>
			<el-button type="text" class="total-record clearfloat">共 <strong>{{ params.total }}</strong>份报告</el-button>
		</div>
		<el-table ref="multipleTable" :data="list" stripe @sort-change="sortChange" @select-all="selectAll" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#88AEE1',color: '#fff'}">
			<el-table-column label="选择" type="selection" align="center" />
			<el-table-column label="序号" type="index" align="center" />
			<el-table-column label="项目名称" prop="projectName" align="center" />
			<el-table-column label="周期" align="center">
				<template #default="scope">
					{{scope.row.year}}年第{{scope.row.weekNum}}月
				</template>
			</el-table-column>
			<el-table-column label="数据采集时间" align="center" width="300px">
				<template #default="scope">
					{{formatDate(scope.row.startDate -  86400 * 1000,'YYYY-MM')}} | {{formatDate(scope.row.startDate,'YYYY-MM')}}
				</template>
			</el-table-column>
			<el-table-column prop="readNum" label="查看次数" align="center" sortable />
			<el-table-column label="版本" prop="version" align="center" />
			<el-table-column label="操作" align="center">
				<template #default="scope">
					<div class="function-i">
						<el-popover width="50px" placement="bottom" trigger="hover">
							<template #reference>
								<i slot="reference" class="el-icon-download"></i>
							</template>
							<div>
								<el-button type="text" @click="downLoadReport(scope.row,'pdf')">pdf</el-button>
							</div>
							<div>
								<el-button type="text" @click="downLoadReport(scope.row, 'docx')">word</el-button>
							</div>
						</el-popover>
						<i style="margin-left: 30px;" class="el-icon-reading" @click="reportView(scope.row)"></i>
					</div>
				</template>
			</el-table-column>
		</el-table>
		<div class="footer">
			<span class="warning">
				仅显示三个月的数据
			</span>
			<el-pagination style="padding: 10px 0;" @current-change="handleCurrentChange" v-model:currentPage="params.pageNo" :page-size="20" layout="total,prev, pager, next" :total="params.total">
			</el-pagination>
		</div>
	</div>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	ref,
	onMounted
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	coolReportList,
	reportReadNum
} from '@/api/statistics/index';
import global from '@/utils/global';
import {
	ElMessage
} from 'element-plus';
import {
	monthExport
} from '../../interface';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			formatDate
		}: object = global();
		const obj: monthExport = {
			params: {
				time: [new Date().setHours(0, 0, 0, 0) - 86400000 * 60, new Date().setHours(0, 0, 0, 0)],
				orderBy: null,
				pageNo: 1,
				type: 5,
				total: 0
			},
			selectionRows: [],
			list: []
		};
		const pageData = reactive(obj);
		const multipleTable = ref(null);
		const downLoadAll = (type: string) => {
			if (pageData.selectionRows.length === 0) return ElMessage.warning("请选择下载周期");
			for (let i = 0; i < pageData.selectionRows.length; i++) {
				var row = pageData.selectionRows[i];
				const iframe = document.createElement("iframe");
				iframe.style.display = "none"; // 防止影响页面
				iframe.style.height = 0; // 防止影响页面
				iframe.src = `${state.common.fileBaseurlD}/phmreport/${row.reportUrl}_${row.timestamp}.${type}`;
				document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
				updateReadNum(row);
				setTimeout(() => {
					iframe.remove();
				}, 5 * 60 * 1000);
			}
			multipleTable.value.clearSelection();
		};
		const updateReadNum = (row: object) => {
			reportReadNum({
				id: row.id
			}).then(() => {
				getList();
			})
		};
		const downLoadReport = (row: object, type: string) => {
			updateReadNum(row);
			// const a = this.$refs['download'];
			const a = document.createElement('a');
			a.download = row.reportUrl;
			a.href = `${state.common.fileBaseurlD}/phmreport/${row.reportUrl}_${row.timestamp}.${type}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		};
		const reportView = (row) => {
			updateReadNum(row);
			window.open(state.common.fileBaseurl + `/phmreport/${row.reportUrl}_${row.timestamp}.pdf`);
		};
		const clearSelect = () => {
			multipleTable.value.clearSelection();
		};
		const sortChange = (e: object) => {
			var order = ''
			if (e.order === 'ascending') {
				order = 'asc'
			}
			if (e.order === 'descending') {
				order = 'desc'
			}
			if (e.prop !== null) {
				pageData.params.orderBy = `${e.prop} ${order}`
			} else {
				pageData.params.orderBy = null
			}
			getList();
		};
		const selectAll = (val: Array < string > ) => {
			pageData.selectionRows = val;
		};
		const handleSelectionChange = (val: Array < string > ) => {
			pageData.selectionRows = val;
		};
		const handleCurrentChange = (val: number) => {
			pageData.params.pageNo = val;
			getList();
		};
		const getList = () => {
			pageData.params.pageNo = 1;
			coolReportList({
				proId: state.common.currentProject.projectId,
				from: pageData.params.time[0],
				to: pageData.params.time[1],
				...pageData.params
			}).then(({
				data
			}: object) => {
				pageData.list = data.data.results;
				pageData.params.total = data.data.totalRecord;
			})
		};
		onMounted(() => {
			getList();
		});
		return {
			...toRefs(pageData),
			multipleTable,
			clearSelect,
			downLoadAll,
			sortChange,
			selectAll,
			handleSelectionChange,
			handleCurrentChange,
			formatDate,
			getList,
			downLoadReport,
			reportView
		}
	}
})
</script>
<style media="screen" lang="scss" scoped>
@import '@/assets/scss/common.scss';
.table-box {
    height: calc(100% - 120px);
    &.table-month-box {
        height: calc(100% - 70px);
    }
    .table-header {
        line-height: 40px;
        height: 40px;
        background: #4581CC;
        color: #fff;
        padding: 0 10px;
        .button-column {
            display: flex;
            flex-direction: column;
        }

        .el-checkbox {
            color: #fff;
            margin-right: 20px;
        }
        .el-button {
            color: #fff;
        }
        .total-record {
            float: right;

            strong {
                font-weight: 600;
                color: #CD180C;
            }
        }
    }
    .function-i {
        font-size: 20px;
        color: #2E91D6;
        i {
            cursor: pointer;
        }
    }
    .footer {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .warning {
            color: #999;
        }
    }
}
</style>
