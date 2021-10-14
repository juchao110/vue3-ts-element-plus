<template>
<div class="equipment-time-page">
	<el-select v-model="system" placeholder="请选择系统" class="width-200 mg-b-20" @change="equipmentAnalysisFun">
		<el-option v-for="item in systemList" :key="item.sysNumber" :label="item.sysName" :value="item.sysNumber">
		</el-option>
	</el-select>
	<el-tabs type="border-card" v-model="activeName" @tab-click="tabChange">
		<el-tab-pane :label="tab.name" :name="tab.key" v-for="(tab,index) in tabList" :key="index">
			<el-tabs :tab-position="'left'" v-model="tab.dayType" @tab-click="tabChange">
				<el-tab-pane :label="day.name" :name="day.key" v-for="(day,dayindex) in dayTypeList" :key="dayindex" style="overflow-y:scroll" :style="{height:height+'px'}">
					<div class="btn-list">
						<el-button :type="bindex==tab.room?'primary':null" v-for="(b,bindex) in tab.data" :key="bindex" @click="handleRoom(bindex)">{{bindex}}</el-button>
					</div>
					<Echart :options="tab.options" :height="400"></Echart>
					<div class="running-data" v-for="(room,rommindex) in tab.data" :key="rommindex">
						<ul class="statistic">
							<li v-for="(s,sindex) in room.statisticDatas" :key="sindex" :class="getStyle(s)">
								<h3>{{sindex}}</h3>
								<el-row :gutter="20" class="item">
									<el-col :span="8" v-for="(time,tindex) in s" :key="tindex">
										<p class="title">{{tindex}}</p>
										<p class="value" v-for="(timedata,dataindex) in time" :key="dataindex">{{dataindex}}{{handleTime(timedata)}}h/{{getDayName(tab.dayType)}}</p>
									</el-col>
								</el-row>
							</li>
						</ul>
					</div>
				</el-tab-pane>
			</el-tabs>
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
	ref,
	getCurrentInstance
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	equipmentAnalysis,
	querySystem
} from '@/api/statistics/index';
import {
	equipmentTime
} from '../../interface';
import {
	_filter,
	_uniq,
	_uniqBy,
	_groupBy,
	_sortBy,
	_difference
} from '@/utils/lodash';
import {
	ElMessage
} from 'element-plus';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const dayTypeList = [{
				name: "天",
				key: "day"
			},
			{
				name: "周",
				key: "week"
			},
			{
				name: "月",
				key: "month"
			}
		]
		const obj: equipmentTime = {
			systemList: [],
			system: '',
			tabList: [{
					name: "压缩机组",
					key: "UCOM",
					room: '',
					dayType: 'day',
					data: {}
				},
				{
					name: "蒸发冷",
					key: "UCON",
					room: '',
					dayType: 'day',
					data: {}
				},
				{
					name: "冷风机",
					key: "AU",
					room: '',
					dayType: 'day',
					data: {}
				}
			],
			activeName: 'UCOM',
			response: {},
			dataLoading: true
		};
		const {
			proxy
		}: any = getCurrentInstance();
		const height = ref(document.documentElement.clientHeight - 270);
		const pageData = reactive(obj);
		const getCurrent = () => {
			return _filter(pageData.tabList, ({
				key
			}: object) => key == pageData.activeName)[0];
		};
		const getData = () => {
			return pageData.response[pageData.activeName];
		};
		const querySystemFun = () => {
			querySystem({
				projectUUid: state.common.currentProject.projectUuid
			}).then(({
				data
			}: object) => {
				pageData.systemList = data.data;
				if (pageData.systemList.length != 0) {
					pageData.system = pageData.systemList[0].sysNumber;
					equipmentAnalysisFun();
				}
			});
		};
		const equipmentAnalysisFun = () => {
			pageData.dataLoading = true;
			equipmentAnalysis({
				projectId: state.common.currentProject.projectId,
				systemCode: pageData.system,
				equipmentType: pageData.activeName
			}).then(({
				data
			}: object) => {
				if (JSON.stringify(data.data[0].data) == "{}") {
					pageData.response[pageData.activeName] = [];
					return ElMessage.warning("暂无数据");
				}

				pageData.response[pageData.activeName] = data.data;
				handleData();
				pageData.dataLoading = false;
			});
		};
		const handleData = (room ? : string) => {
			const current = getCurrent();
			const data = getData();
			current.data = _filter(data, ({
				dayType
			}: object) => dayType == current.dayType)[0].data;
			current.room = room ? room : Object.keys(current.data).length == 0 ? '' : Object.keys(current.data)[0];
			current.options = doData(current.data[current.room].runningDatas, current.key, current.dayType);
		};
		const tabChange = () => {
			if (!getData()) return equipmentAnalysisFun();
			else handleData();
		};
		const handleRoom = (room: string) => {
			handleData(room);
		};
		const doData = (data: Array < object > , equip: string, dayType: string) => {
			const time: Array < string | number > = _uniq(data.map((e: object) => e.timestamp)); //获取所有时间
			let seriesData: Array < object > = [],
				timeData: Array < string | number > = _uniqBy(data, "timestamp"); //获取时间刻度
			let group: object = _groupBy(data, "equipmentName");

			if (equip == "AU" || equip == "UCON") {
				seriesData = Object.keys(group).map((k: string) => {
					const def: Array < string | number > = _difference(time, group[k].map(time => time.timestamp));
					const newArr: Array < object > = [
						...group[k],
						...def.map((d: string | number) => {
							return {
								timestamp: Number(d),
								value: null
							};
						})
					];
					return {
						type: "line",
						sortNum: equip == "UCON" ?
							k == "水泵运行" ?
							1 :
							2 : equip == "AU" ?
							k == "制冷运行" ?
							1 :
							2 : null,
						yAxisIndex: equip == "AU" ? (k == "制冷运行" ? 0 : 1) : 0,
						areaStyle: k == "制冷运行" || k == "水泵运行" ? {
							color: {
								type: "linear",
								x: 0,
								y: 0,
								x2: 0,
								y2: 1,
								colorStops: [{
										offset: 0,
										color: "#09e" // 0% 处的颜色
									},
									{
										offset: 1,
										color: "#fff" // 100% 处的颜色
									}
								],
								global: false // 缺省为 false
							}
						} : {
							opacity: 0
						},
						name: k,
						label: {
							normal: {
								show: true,
								position: k == "制冷运行" || k == "水泵运行" ? "top" : "bottom"
							}
						},
						data: _sortBy(_uniqBy(newArr, "timestamp"), "timestamp").map(
							(e: object) => {
								return handleTime(e.value);
							}
						)
					};
				});
			} else {
				seriesData.push({
					type: "line",
					name: "运行时长",
					label: {
						normal: {
							show: true,
							position: "top"
						}
					},
					color: "#09e",
					areaStyle: {
						color: {
							type: "linear",
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [{
									offset: 0,
									color: "#09e" // 0% 处的颜色
								},
								{
									offset: 1,
									color: "#fff" // 100% 处的颜色
								}
							],
							global: false // 缺省为 false
						}
					},
					data: _sortBy(data, "timestamp").map((e: object) => {
						return handleTime(e.value);
					})
				});
			}
			let option = {};
			option = {
				title: {
					subtext: equip == "UCOM" ?
						"单位：h" : `单位：h/(${
                  _filter(dayTypeList, ({key}:object) => key == dayType)[0]
                    .name
                }·台)`,
					left: "right",
					right: "right"
				},
				color: ["#09e", "#c23531"],
				tooltip: {
					trigger: "axis",
					formatter: (params: Array < object > ) => {
						return _uniqBy(params, "componentIndex")
							.map((e: object) => {
								return `<p>${e.marker}${
                  dayType == "day"
                    ? proxy.$root.$moment(e.axisValue).format("YYYY-MM-DD")
                    : this.params.dayType == "week"
                    ? `${proxy.$root.$moment(e.axisValue).year()}年${proxy.$root.$moment(
                        e.axisValue
                      ).week()}周`
                    : `${proxy.$root.$moment(e.axisValue).year()}年${proxy.$root.$moment(
                        e.axisValue
                      ).month() + 1}月`
                }:${e.value==null ?  "-":e.value}小时</p>`;
							})
							.join("");
					}
				},
				grid: {
					right: "3%",
					left: "5%"
				},
				legend: {
					selected: {
						化霜运行: false
					},
					data: equip == "AU" || equip == "UCON" ?
						_sortBy(Object.keys(_groupBy(data, "equipmentName"))) : ["运行时长"]
				},
				xAxis: [{
					boundaryGap: false,
					type: "category",
					data: _uniq(
						_sortBy(data, "timestamp").map((e: object) => {
							return proxy.$root.$moment(e.timestamp).format("YYYY-MM-DD");
						})
					),
					axisLabel: {
						formatter: (value: number) => {
							if (dayType == "day") {
								return proxy.$root.$moment(value).format("YYYY-MM-DD");
							} else if (dayType == "week") {
								return `${proxy.$root.$moment(value).year()}年${proxy.$root.$moment(
                    value
                  ).week()}周`;
							} else {
								return `${proxy.$root.$moment(value).year()}年${proxy.$root.$moment(
                    value
                  ).month() + 1}月`;
							}
						}
					}
				}],
				yAxis: equip == "AU" ? [{
						type: "value",
						position: "left",
						splitLine: {
							show: false
						},
						name: `制冷时长`
					},
					{
						type: "value",
						position: "right",
						splitLine: {
							show: false
						},
						name: `化霜时长`
					}
				] : [{
					type: "value",
					splitLine: {
						show: false
					},
					name: `运行时长`
				}],
				dataZoom: [{
						startValue: dayType == "day" ?
							timeData.length > 14 ?
							proxy.$root.$moment(
								_sortBy(timeData, "timestamp")[timeData.length - 14]
								.timestamp
							).format("YYYY-MM-DD") :
							proxy.$root.$moment(
								_sortBy(timeData, "timestamp")[0].timestamp
							).format("YYYY-MM-DD") : dayType == "week" ?
							timeData.length > 6 ?
							proxy.$root.$moment(
								_sortBy(timeData, "timestamp")[timeData.length - 6]
								.timestamp
							).format("YYYY-MM-DD") :
							proxy.$root.$moment(
								_sortBy(timeData, "timestamp")[0].timestamp
							).format("YYYY-MM-DD") : timeData.length > 6 ?
							proxy.$root.$moment(
								_sortBy(timeData, "timestamp")[timeData.length - 6]
								.timestamp
							).format("YYYY-MM-DD") : proxy.$root.$moment(
								_sortBy(timeData, "timestamp")[0].timestamp
							).format("YYYY-MM-DD")
					},
					{
						type: "inside"
					}
				],

				series: _sortBy(seriesData, "sortNum")
			};
			return option;
		};
		const handleTime = (time: string | number) => {
			if (time == 0) return 0;
			if (!time) return null;
			return (Math.floor(time) / 3600).toFixed(2);
		};
		const getDayName = (t: string) => {
			return _filter(dayTypeList, ({
				key
			}: object) => key == t)[0].name;
		};
		const getStyle = (obj: object) => {
			const first = Object.keys(obj)[0];
			const second = Object.keys(obj)[1];
			if (Object.values(obj[first])[0] > Object.values(obj[second])[0]) return 'first-red'
			else if (Object.values(obj[first])[1] > Object.values(obj[second])[1]) return 'second-red'
			else return false
		};
		onMounted(() => {
			querySystemFun();
		});
		return {
			...toRefs(pageData),
			dayTypeList,
			tabChange,
			equipmentAnalysisFun,
			handleRoom,
			handleTime,
			getDayName,
			getStyle,
			height
		}
	}
})
</script>
<style media="screen" lang="scss" scoped>
@import "@/assets/scss/common.scss";
.equipment-time-page {
    .btn-list {
        text-align: center;
        margin-bottom: 30px;
    }
    .statistic {
        @include padding_l(50px);
        li {
            width: 100%;
            @include margin_b(30px);
            h3 {
                position: relative;
                font-weight: normal;
                color: $primaryColor;
                @include padding_l(30px);
                &:before {
                    content: '';
                    width: 6px;
                    height: 20px;
                    background: $primaryColor;
                    position: absolute;
                    left: 0;
                    top: 0;
                }
            }
            .item {
                text-align: center;
                .title {
                    @include margin_b(20px);
                }
                .value {
                    @include margin_b(20px);
                }
            }
            &.first-red {
                .el-col {
                    &:first-child {
                        .value {
                            &:nth-child(2) {
                                color: $redColor;
                            }
                        }

                    }
                }
            }
            &.second-red {
                .el-col {
                    &:first-child {
                        .value {
                            &:nth-child(3) {
                                color: $redColor;
                            }
                        }

                    }
                }
            }
        }
    }
}
</style>
