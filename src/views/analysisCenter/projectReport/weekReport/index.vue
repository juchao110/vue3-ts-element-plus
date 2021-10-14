<template>
<el-tabs type="border-card" v-model="activeName" @tab-click="handleSearch">
	<el-tab-pane :label="tab.name" :name="tab.key" v-for="(tab,index) in tabList" :key="index">
		<div class="select-box mg-b-20">
			<el-date-picker v-model="tab.time" class="mg-r-20" type="daterange" align="right" value-format="x" start-placeholder="开始日期" end-placeholder="结束日期">
			</el-date-picker>
			<el-button type="primary" @click="handleSearch">查询</el-button>
		</div>
		<div class="table-box">
			<div class="table-header">
				<el-button type="text">已选择{{tab.selectionRows.length}}条</el-button>
				<el-button type="text" @click="clearSelect">清除</el-button>
				<el-popover width="50px" placement="bottom" trigger="hover">
					<template #reference>
						<el-button type="text">下载</el-button>
					</template>
					<div>
						<el-button type="text" @click="downLoadAll('pdf',tab)">pdf</el-button>
					</div>
					<div>
						<el-button type="text" @click="downLoadAll('docx',tab)">word</el-button>
					</div>
				</el-popover>
				<el-button type="text" class="total-record clearfloat">共 <strong>{{ tab.total }}</strong>份报告</el-button>
			</div>
			<el-table ref="multipleTable" :data="tab.data" stripe @sort-change="sortChange" @select-all="selectAll" @selection-change="handleSelectionChange" :header-cell-style="{backgroundColor: '#88AEE1',color: '#fff'}">
				<el-table-column label="选择" type="selection" align="center" />
				<el-table-column label="序号" type="index" align="center" />
				<el-table-column label="项目名称" prop="projectName" align="center" />
				<el-table-column label="周期" align="center">
					<template #default="scope">
						{{scope.row.year}}年第{{scope.row.weekNum}}周
					</template>
				</el-table-column>
				<el-table-column label="数据采集时间" align="center" width="300px">
					<template #default="scope">
						{{formatDate(scope.row.startDate,'YYYY-MM-DD') }} | {{formatDate(scope.row.endDate,'YYYY-MM-DD') }}
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
				<el-pagination style="padding: 10px 0;" @current-change="handleCurrentChange" v-model:currentPage="tab.pageNo" :page-size="20" layout="total,prev, pager, next" :total="tab.total">
				</el-pagination>
			</div>
		</div>
	</el-tab-pane>
</el-tabs>
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
import {
	reportType
} from '../../data';
import {
	temperatureDay
} from '../../interface';
import {
	_filter
} from '@/utils/lodash';
import global from '@/utils/global';
import {
	ElMessage
} from 'element-plus';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: temperatureDay = {
			activeName: '',
			tabList: []
		};
		const {
			formatDate
		}: object = global();
		const pageData = reactive(obj);
		pageData.tabList = reportType.map(({
			name,
			key
		}: object, index: number) => {
			if (index === 0) pageData.activeName = key;
			return {
				name,
				key,
				time: [new Date().setHours(0, 0, 0, 0) - 86400000 * 7, new Date().setHours(0, 0, 0, 0)],
				orderBy: null,
				pageNo: 1,
				selectionRows: []
			}
		});
		const multipleTable = ref(null);
		const getList = () => {
			coolReportList({
				proId: state.common.currentProject.projectId,
				from: getCurrent().time[0],
				to: getCurrent().time[1],
				orderBy: getCurrent().orderBy,
				pageSize: 20,
				type: getCurrent().key
			}).then(({
				data
			}: object) => {
				getCurrent().data = data.data.results;
				getCurrent().total = data.data.totalRecord;
			})
		};
		const clearSelect = () => {
			multipleTable.value.clearSelection();
		};
		const downLoadAll = (type: string, tab: object) => {
			if (tab.selectionRows.length === 0) return ElMessage.warning("请选择下载周期");
			for (let i = 0; i < tab.selectionRows.length; i++) {
				var row = tab.selectionRows[i];
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
		const getCurrent = () => {
			return _filter(pageData.tabList, ({
				key
			}: object) => key == pageData.activeName)[0];
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
				getCurrent().orderBy = `${e.prop} ${order}`
			} else {
				getCurrent().orderBy = null
			}
			getList();
		};
		const selectAll = (val: Array < string > ) => {
			getCurrent().selectionRows = val;
		};
		const handleSelectionChange = (val: Array < string > ) => {
			getCurrent().selectionRows = val;
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
		const handleCurrentChange = (val: number) => {
			getCurrent().pageNo = val;
			handleSearch();
		};
		const handleSearch = () => {
			getList();
		};
		onMounted(() => {
			handleSearch();
		});
		return {
			...toRefs(pageData),
			getList,
			multipleTable,
			clearSelect,
			downLoadAll,
			sortChange,
			selectAll,
			handleSelectionChange,
			downLoadReport,
			reportView,
			formatDate,
			handleCurrentChange,
			handleSearch
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
