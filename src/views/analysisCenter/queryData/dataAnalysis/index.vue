<template>
<div class="">
	<div class="">
		<el-select class="width-200 mg-r-20" v-model="form.systemGroup" @change="handleSystemGroup" filterable clearable placeholder="选择监控组">
			<el-option v-for="i in systemGroupList" :label="i.monitorGroupName" :key="i.monitorGroupId" :value="i.monitorGroupId"></el-option>
		</el-select>
		<el-select class="width-200 mg-r-20" v-model="form.point" @change="handlePoint" collapse-tags filterable placeholder="选择监测点">
			<el-option-group v-for="group in pointList" :key="group.metric" :label="group.metric">
				<el-option v-for="item in group.metricDatas" :key="JSON.stringify(item.monitorData)" :label="item.monitorData.pointName" :value="JSON.stringify(item.monitorData)">
				</el-option>
			</el-option-group>
		</el-select>
		<el-select class="width-200 mg-r-20" v-model="form.interval" @change="watchTimeChange" placeholder="请选择时间间隔" clearable>
			<el-option v-for="t in intervalList" :key="t.key" :label="t.name" :value="t.key"></el-option>
		</el-select>
		<el-date-picker class="width-200 mg-r-20" v-model="form.time" @change="watchTimeChange" @calendar-change="calendarChange" :disabledDate="pickerOptions" type="datetimerange" value-format="x" range-separator="至" start-placeholder="开始日期"
			end-placeholder="结束日期">
		</el-date-picker>
		<el-button type="primary" @click="searchData" :disabled="choosedPointList.length == colorList.length">查询</el-button>
	</div>
	<div class="choosed-list clearfloat" v-if="choosedPointList.length != 0">
		<div class="left-list l">
			<el-row :gutter="20">
				<el-col :span="3">颜色</el-col>
				<el-col :span="6">测点编码</el-col>
				<el-col :span="6">测点名称</el-col>
				<el-col :span="4">上限</el-col>
				<el-col :span="4">下限</el-col>
			</el-row>
			<div class="scroll-div">
				<el-row class="list-row" v-for="(p, index) in choosedPointList" :key="index" :gutter="20">
					<el-col :span="3">
						<el-tag :color="p.color" class="tag-icon"></el-tag>
					</el-col>
					<el-col :span="6">
						{{ p.pointCode }}
					</el-col>
					<el-col :span="6">
						{{ p.pointName }}
					</el-col>
					<el-col :span="4">
						<el-input v-model="p.max" type="number" size="small" class="min-input"></el-input>
					</el-col>
					<el-col :span="4">
						<el-input v-model="p.min" type="number" size="small" class="min-input"></el-input>
					</el-col>
					<el-col :span="1">
						<i class="el-icon-circle-close close-icon" title="删除" @click="deletePointList(p.pointCode)"></i>
					</el-col>
				</el-row>
			</div>
		</div>
		<div class="right-btn r">
			<el-button class="submit-btn" type="primary" @click="doData">确定</el-button>
		</div>
	</div>
	<Echart :options="options" :height="600"></Echart>
</div>
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
import {
	queryGroupsMetricData,
	queryGroups
} from '@/api/intelligentMonitor/index';
import {
	trendAnalysisWithoutCompress
} from '@/api/statistics/index';
import {
	colorList,
	intervalList
} from '../../data';
import {
	ElMessage
} from 'element-plus';
import {
	_compact,
	_groupBy,
	_sortBy
} from '@/utils/lodash';
import {
	queryData
} from '../../interface';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: queryData = {
			systemGroupList: [],
			pointList: [],
			point: '',
			response: [],
			choosedPointList: [],
			options: {},
			form: {
				systemGroup: '',
				point: '',
				interval: null,
				time: []
			},
			currentSelect: 0
		};
		const pageData = reactive(obj);
		const queryGroupsFun = () => {
			queryGroups({
				projectId: state.common.currentProject.projectId,
				projectUuid: state.common.currentProject.projectUuid
			}).then(({
				data
			}: object) => {
				pageData.systemGroupList = data.data;
			});
		};
		const queryGroupsMetricDataFun = (id: string) => {
			queryGroupsMetricData({
				from: 1561435200000, //随便传，无影响
				to: 1561478400000, //随便传，无影响
				monitorGroupId: id,
				projectId: state.common.currentProject.projectId,
				projectUuid: state.common.currentProject.projectUuid,
				queryType: 1
			}).then(({
				data
			}: object) => {
				pageData.pointList = data.data;
			});
		};
		const trendAnalysisWithoutCompressFun = (params: object) => {
			trendAnalysisWithoutCompress(params).then(({
				data
			}: object) => {
				pageData.response = data.data.map((e: object) => {
					e.value = e.value.toFixed(2);
					return e;
				});
				if (pageData.response.length == 0) {
					ElMessage.warning("暂无数据");
					pageData.choosedPointList = [];
				} else {
					pageData.choosedPointList.forEach((e: object, index: number) => {
						if (JSON.stringify(pageData.response).indexOf(e.pointCode) < 0) {
							pageData.choosedPointList.splice(index, 1);
							colorList.forEach(c => {
								if (c.color == e.color) c.isUsed = false;
							});
							ElMessage.warning("当前测点暂无数据");
						}
					});
				}
				doData();
			});
		};
		const handleSystemGroup = (data: string) => {
			pageData.point = "";
			pageData.pointList = [];
			pageData.form.point = '';
			if (!data) return false;
			queryGroupsMetricDataFun(data);
		};
		const searchData = () => {
			if (!pageData.form.systemGroup) return ElMessage.error('请选择监控组');
			if (!pageData.form.point) return ElMessage.error('请选择测点');
			if (pageData.form.time.length == 0) return ElMessage.error('请选择时间');
			pageData.choosedPointList = pageData.choosedPointList.map((v: object) => {
				return {
					...v,
					startDateTime: pageData.form.time[0],
					endDateTime: pageData.form.time[1],
					interval: pageData.form.interval,

				};
			});
			const isExit = JSON.stringify(pageData.choosedPointList).includes(
				JSON.parse(pageData.form.point).pointCode
			);
			if (isExit && pageData.timeStatus == 0) doData();
			else if (isExit && pageData.timeStatus == 1) {
				pageData.choosedPointList = pageData.choosedPointList.map(k => {
					return {
						...k,
						interval: pageData.form.interval,
						...{
							startDateTime: pageData.form.time[0],
							endDateTime: pageData.form.time[1]
						}
					};
				});
				return trendAnalysisWithoutCompressFun(pageData.choosedPointList);
			} else {
				pageData.choosedPointList.push({
					...{
						startDateTime: pageData.form.time[0],
						endDateTime: pageData.form.time[1],
						interval: pageData.form.interval,
						color: setLineColor(),
						min: "",
						max: ""
					},
					...JSON.parse(pageData.form.point)
				});
				if (pageData.choosedPointList.length == colorList.length)
					ElMessage.warning(`测点最多可选${colorList.length}个`);
				trendAnalysisWithoutCompressFun(pageData.choosedPointList);
			}
			pageData.timeStatus = 0;
		};
		const deletePointList = (id: string) => {
			const index = pageData.choosedPointList.map((v: object, index: number) => {
				if (v.pointCode == id) {
					colorList.forEach((e: object) => {
						if (e.color == v.color) e.isUsed = false;
					});
					return index + 1;
				}
			});
			pageData.choosedPointList.splice(_compact(index)[0] - 1, 1);
			doData();
		};
		const watchTimeChange = () => {
			console.log('timechange')
			pageData.timeStatus = 1;
		};
		const setLineColor = () => {
			const item = _compact(
				colorList.map((e: object) => {
					if (e.isUsed == false) return e;
				})
			)[0];
			colorList.forEach((e: object) => {
				if (e.color == item.color) e.isUsed = true;
			});
			return item.color;
		};
		const doData = () => {
			let chartList = [];
			if (pageData.choosedPointList.length == 0) return false;
			chartList = pageData.choosedPointList.map((e: object) => {
				let data = _groupBy(_sortBy(pageData.response, "dateTime"), "propCode");
				for (let i in data) {
					if (i === e.pointCode) {
						return {
							...e,
							data: data[i].map((k: object) => {
								let {
									propCode,
									...obj
								} = k;
								return Object.values(obj);
							})
						};
					}
				}
			});
			let colors = [],
				yAxis = [],
				series = [],
				legend = [];
			chartList.forEach((e: object, index: number) => {
				legend.push(e.pointName);
				colors.push(e.color);
				yAxis.push({
					show: true,
					type: "value",
					// name: e.pointName,
					min: e.min ? Math.floor(e.min) : undefined,
					max: e.max ? Math.floor(e.max) : undefined,
					offset: 50 * index,
					position: "right",
					axisLine: {
						show: true,
						onZero: false,
						lineStyle: {
							color: e.color
						}
					}
				});
				series.push({
					name: e.pointName,
					lineStyle: {
						color: e.color
					},
					symbol: "none",
					// smooth: true,
					yAxisIndex: index,
					type: "line",
					data: e.data
				});
			});
			pageData.loading = true;
			setTimeout(() => {
				pageData.options = {
					tooltip: {
						trigger: "axis",
						axisPointer: {
							type: "line"
						}
					},
					grid: {
						left: "2%",
						right: `${pageData.choosedPointList.length * 3}%`
					},
					toolbox: {
						left: "center",
						itemSize: 14,
						top: 25,
						feature: {
							dataZoom: {
								yAxisIndex: "none"
							},
							dataView: {
								show: false,
								readOnly: false
							},
							restore: {
								show: true
							},
							saveAsImage: {
								show: true
							}
						}
					},
					legend: {
						data: legend
					},
					xAxis: [{
						type: "time",
						boundaryGap: false,
						splitLine: {
							show: false
						},
						axisLine: {
							onZero: false
						},
					}],
					yAxis: yAxis,
					series: series,
					color: colors
				};
			}, 1000);
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
			queryGroupsFun();
		});
		return {
			...toRefs(pageData),
			intervalList,
			handleSystemGroup,
			watchTimeChange,
			colorList,
			searchData,
			deletePointList,
			doData,
			pickerOptions,
			calendarChange
		}
	}
})
</script>
<style media="screen" lang="scss" scoped>
@import "@/assets/scss/common.scss";
.choosed-list {
    @include padding(10px);
    @include margin_b(30px);
    font-size: 12px;
    position: relative;
    .right-btn {
        width: 15%;
        text-align: center;
        position: absolute;
        top: 50%;
        right: 0;
        @include margin_t(-10px);
    }
    .left-list {
        width: 85%;
        .el-row {
            height: 25px;
            line-height: 25px;
        }
        .list-row {
            height: 32px;
            line-height: 32px;
            overflow: hidden;
            & > div {
                height: 32px;
                line-height: 32px;
            }
            .close-icon {
                cursor: pointer;
                font-size: 18px;
                color: $redColor;
                @include margin_t(5px)
            }
            .tag-icon {
                width: 20px;
                height: 20px;
                @include margin_t(5px);
            }
        }
    }

    .submit-btn {
        display: block;
        margin: 0 auto;
    }
}
</style>
