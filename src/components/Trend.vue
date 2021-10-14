<template lang="html">
  <div class="trend-component">
    <div class="">
        <el-date-picker v-model="dateRange" type="datetimerange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
  		</el-date-picker>
        <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>
    <div class="chart-box"  v-loading="state.common.loading">
			<div class="chart" id="trendChart" style="height:400px"></div>
		</div>
  </div>
</template>

<script lang="ts">
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	onMounted,
	watch
} from 'vue';
import {
	useStore
} from "vuex";
import {
	trendAnalysis
} from "@/api/paramsMonitor/index";
import {
	_sortBy,
	_groupBy,
	_max,
	_min,
	_difference
} from '@/utils/lodash';
import global from "@/utils/global";
interface range {
	dateRange: any
}
export default defineComponent({
	props: {
		time: {
			type: Array,
			default: [new Date().getTime() - 86400000, new Date().getTime()],
		},
		pointName: {
			type: String,
			default: '',
			required: true
		},
		pointCode: {
			type: String,
			default: '',
			required: true
		},
		metric: {
			type: String,
			default: '',
			required: true
		},
		alarmConfig: {
			type: Array,
			default: []
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			timestamp
		}: any = global();
		const obj: range = {
			dateRange: [props.time[0], props.time[1]]
		}
		const data = reactive(obj);
		watch(() => [props.pointCode, props.time], (nv, ov) => {
			if (_difference(nv[1], ov[1]).length != 0) data.dateRange = nv[1];
			trendAnalysisFun()
		})
		const handleSearch = () => {
			trendAnalysisFun()
		}
		const trendAnalysisFun = () => {
			trendAnalysis([{
				startDateTime: data.dateRange[0],
				endDateTime: data.dateRange[1],
				...props
			}]).then((res: any) => {
				const response = res.data.data;
				const chart = proxy.$root.$echarts.init(document.getElementById('trendChart'));
				const {
					maxYaxis,
					minYaxis,
					markLine
				}: any = handleMarkLine();
				console.log(maxYaxis,
					minYaxis, markLine)
				chart.clear();
				chart.setOption({
					legend: {
						data: [props.pointName]
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'cross'
						},
					},
					toolbox: {
						show: true,
						feature: {
							dataZoom: {
								yAxisIndex: "none"
							},
							magicType: {
								type: ["line", "bar"]
							},
						}
					},
					xAxis: {
						type: 'time',
						boundaryGap: false
					},
					yAxis: [{
						name: null,
						type: "value",
						max: _max([...response.map((e: any) => Math.round(e.value) + 1), maxYaxis]),
						min: _min([...response.map((e: any) => Math.round(e.value) - 1), minYaxis]),
						boundaryGap: ['5%', '5%']
					}],
					series: {
						name: props.pointName,
						type: 'line',
						showSymbol: false,
						smooth: true,
						markLine: {
							data: markLine
						},
						data: _sortBy(response, 'dateTime').map((time: any) => [proxy.$root.$moment(time.dateTime).format('YYYY-MM-DD HH:mm:ss'), Number(time.value.toFixed(2))])
					}
				})
			})
		};
		const handleMarkLine = () => {
			if (props.alarmConfig != null && props.alarmConfig.length > 0) {
				const grouped_alarm_config = _groupBy(
					props.alarmConfig,
					"alarmType"
				);
				let maxY: any = [],
					minY: any = [],
					markLine: any = '';
				markLine = Object.keys(grouped_alarm_config).flatMap((f: any) => {
					const config = grouped_alarm_config[f];
					return config.flatMap((f: any) => {
						if (Number(f["customAlarmType"] == 1)) {
							maxY.push(Number(f["upper"]))
							return {
								name: "上限",
								yAxis: Number(f["upper"]),
								label: {
									position: 'end',
									formatter: '{b}：{c}'
								},
								lineStyle: {
									type: "dashed",
									color: f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 1 ? '#0b6' : f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 2 ? '#cec823' : f.alarmType.substr(f.alarmType.length - 1, f
											.alarmType.length) == 3 ?
										'#f00' : ''
								}
							};
						} else if (Number(f["customAlarmType"] == 0)) {
							minY.push(Number(f["lower"]))
							return {
								name: "下限",
								yAxis: Number(f["lower"]),
								label: {
									position: 'end',
									formatter: '{b}：{c}'
								},
								lineStyle: {
									type: "dashed",
									color: f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 1 ? '#0b6' : f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 2 ? '#cec823' : f.alarmType.substr(f.alarmType.length - 1, f
											.alarmType.length) == 3 ?
										'#f00' : ''
								}

							};
						} else {
							maxY.push(Number(f["upper"]))
							minY.push(Number(f["lower"]))
							return [{
									name: "上限",
									yAxis: Number(f["upper"]),
									label: {
										position: 'end',
										formatter: '{b}：{c}'
									},
									lineStyle: {
										type: "dashed",
										color: f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 1 ? '#0b6' : f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 2 ? '#cec823' : f.alarmType.substr(f.alarmType.length - 1, f
												.alarmType.length) == 3 ?
											'#f00' : ''
									}
								},
								{
									name: "下限",
									yAxis: Number(f["lower"]),
									label: {
										position: 'end',
										formatter: '{b}：{c}'
									},
									lineStyle: {
										type: "dashed",
										color: f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 1 ? '#0b6' : f.alarmType.substr(f.alarmType.length - 1, f.alarmType.length) == 2 ? '#cec823' : f.alarmType.substr(f.alarmType.length - 1, f
												.alarmType.length) == 3 ?
											'#f00' : ''
									}
								}
							];
						}
					});
				});
				const maxYaxis = _max(maxY)
				const minYaxis = _min(minY)
				return {
					maxYaxis,
					minYaxis,
					markLine,
				}
			} else {
				return {
					maxYaxis: null,
					minYaxis: null,
					markLine: null
				}
			}
		};
		onMounted(() => {
			trendAnalysisFun();
		})
		return {
			...toRefs(data),
			...props,
			state,
			handleSearch
		}
	}
})
</script>

<style lang="css" scoped>
</style>
