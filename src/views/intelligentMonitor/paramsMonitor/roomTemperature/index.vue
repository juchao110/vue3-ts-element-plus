<template lang="html">
  <div class="room-temperature-page">
    <div class="search-params">
      <el-date-picker v-model="time" type="datetimerange" value-format="x" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
		</el-date-picker>
		<el-button type="primary" @click="searchAction">搜索</el-button>
    显示重要通知
    <el-switch v-model="openNotice" active-color="#13ce66" inactive-color="#ccc" @change="getNoticeAndChartFun">
		</el-switch>
    </div>
    <el-row :gutter="20">
      <el-col :span="4">
        <div>
				<el-menu :default-active="defaultActive" class="el-menu-vertical-demo" @select="handleSelect">
					<el-menu-item :index="m.roomNumber" v-for="(m, index) in roomList" :key="m.roomNumber">
						<span slot="title" class="menu-title">
							{{ m.roomName }}
							<i class="el-icon-arrow-right"></i>
						</span>
					</el-menu-item>
				</el-menu>
			</div>
      </el-col>
      <el-col :span="20">
        <ul class="chart-list">
				<li v-for="(c,index) in roomMonitorList" class="mg-b-10" :key="index">
					<div class="li-header mg-t-20">
						<p class="mg-l-20">
							{{ currentRoomName }}{{ c.name }}：
							<span class="current">{{ fix(currentItem[c.name]) }} {{ c.unit }}</span>（当前值）
						</p>
						<p><span class="mg-r-20 upper" v-if="!!c.upperData && c.upperData.length > 0">(温度上下限：{{ getLimit(c.upperData)}})</span></p>
					</div>
					<div class="interval-box mg-l-20">
						设置纵坐标区间:
						<el-input v-model="c.min" size="small" placeholder="最小值" class="width-100" /> -
						<el-input v-model="c.max" size="small" placeholder="最大值" class="width-100 mg-r-20" />
            <el-button type="primary" size="small" @click="handleEchart()">确 定</el-button>
					</div>
          <div class="chart-div" :id="'chart'+index" style="height:300px"></div>
				</li>
			</ul>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	onBeforeMount,
	onMounted,
	nextTick
} from 'vue';
import {
	useStore
} from "vuex";
import {
	queryRooms,
	queryRoomMonitor,
	queryNoticeByPro
} from "@/api/paramsMonitor/index";
import {
	_filter,
	_last,
	_sortBy,
	_compact
} from '@/utils/lodash';
import {
	roomTemperature
} from '../interface';
import notice from '@/utils/notice';
import global from '@/utils/global';
const resetExtend = {
	tooltip: {
		textStyle: {
			color: '#fff'
		},
		axisPointer: {
			type: 'cross',
			label: {
				backgroundColor: '#5688f4',
				color: '#fff',
				fontSize: 16,
				fontWeight: 'bold'
			}
		}
	},
	grid: {
		left: "2%",
		right: "2%",
		containLabel: true
	},
	xAxis: {
		splitLine: {
			show: false
		},
	},
	yAxis: {
		splitLine: {
			show: true,
			lineStyle: {
				color: "#eee"
			}
		},
		scale: true,
	},
	series: {
		symbol: "none",
		smoothMonotone: "x",
		markArea: []
	}
}
export default defineComponent({
	setup() {
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			fix
		}: any = global();
		const {
			setTooltipDateFormatter,
			setDayTimeMarkArea
		}: any = notice();
		const store = useStore();
		const state = store.state;
		const obj: roomTemperature = {
			roomList: [],
			defaultActive: '',
			currentRoomName: '',
			currentItem: {},
			time: [new Date().getTime() - 86400000, new Date().getTime()],
			roomMonitorList: [],
			openNotice: false,
			noticeList: [],
			markArea: {}
		};
		const pageData = reactive(obj);
		const queryRoomsList = async () => {
			await nextTick();
			queryRooms({
				projectUuid: state.common.currentProject.projectUuid
			}).then((res: any) => {
				pageData.roomList = _filter(
					res.data.data,
					(o: any) => o.roomName && !(o.roomName.indexOf("机房") > -1)
				);
				pageData.roomList.forEach((r: any, index: string | number) => {
					if (index == 0) {
						pageData.defaultActive = r.roomNumber;
						pageData.currentRoomName = r.roomName;
					}
				});
				queryRoomMonitorData(pageData.defaultActive);
			})
		};

		const queryRoomMonitorData = async (id: string | number) => {
			await nextTick();
			queryRoomMonitor({
				startDateTime: Number(pageData.time[0]),
				endDateTime: Number(pageData.time[1]),
				projectCode: state.common.currentProject.projectId,
				deviceCode: id
			}).then((res: any) => {
				if (res.data.data.length == 0) return pageData.roomMonitorList = [];
				pageData.roomMonitorList = res.data.data;
				pageData.currentItem = {
					温度: _filter(pageData.roomMonitorList, (o: any) => o.name == '温度')[0].length != 0 ? _filter(pageData.roomMonitorList, (o: any) => o.name == '温度')[0].currValue : '',
					湿度: _filter(pageData.roomMonitorList, (o: any) => o.name == '湿度').length != 0 ? _filter(pageData.roomMonitorList, (o: any) => o.name == '湿度')[0].currValue : ''
				}
				pageData.roomMonitorList = _sortBy(pageData.roomMonitorList, "level");
				handleEchart({
					trigger: 'axis',
					axisPointer: {
						type: 'cross'
					}
				});
			})
		};
		const getNoticeAndChartFun = () => {
			if (!pageData.openNotice) {
				pageData.markArea = {};
				queryRoomMonitorData(pageData.defaultActive);
			} else {
				pageData.roomMonitorList = [];
				Promise.all([
					queryRoomMonitor({
						startDateTime: Number(pageData.time[0]),
						endDateTime: Number(pageData.time[1]),
						projectCode: state.common.currentProject.projectId,
						deviceCode: pageData.defaultActive
					}),
					queryNoticeByPro({
						proId: state.common.currentProject.projectId,
						roomNoIds: pageData.defaultActive,
						startTime: Number(pageData.time[0]),
						endTime: Number(pageData.time[1]),
					})
				]).then((res: any) => {
					if (res[0].data.data.length == 0) return pageData.roomMonitorList = [];
					pageData.roomMonitorList = res[0].data.data;
					pageData.currentItem = {
						温度: _filter(pageData.roomMonitorList, (o: any) => o.name == '温度')[0].length != 0 ? _filter(pageData.roomMonitorList, (o: any) => o.name == '温度')[0].currValue : '',
						湿度: _filter(pageData.roomMonitorList, (o: any) => o.name == '湿度').length != 0 ? _filter(pageData.roomMonitorList, (o: any) => o.name == '湿度')[0].currValue : ''
					}
					pageData.roomMonitorList = _sortBy(pageData.roomMonitorList, "level");

					pageData.noticeList = res[1].data.data[`${pageData.defaultActive}`];
					pageData.markArea = setDayTimeMarkArea(pageData.roomMonitorList[0].datas, pageData.noticeList)
					const tooltip: any = {
						trigger: 'axis',
						axisPointer: {
							type: 'cross'
						},
						formatter: (params: any) => {
							return setTooltipDateFormatter(params, pageData.noticeList, 'time');
						}
					}

					handleEchart(tooltip, pageData.markArea);
				})
			}
		};

		const handleEchart = async (tooltip: any = {
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			}
		}, markArea ? : any) => {
			await nextTick();
			if (!markArea) markArea = pageData.markArea;
			pageData.roomMonitorList.forEach((e: any, index: string | number) => {
				var last = _last(_sortBy(e.datas, "date"));
				if (pageData.time[1] < new Date().getTime()) last.date = pageData.time[1];
				else last.date = new Date().getTime();
				e.datas.push(last);
				const chart = proxy.$root.$echarts.init(document.getElementById(`chart${index}`));
				chart.clear();
				chart.setOption({
					legend: {
						data: e.name
					},
					tooltip: tooltip,
					xAxis: {
						type: 'time',
						boundaryGap: false
					},
					yAxis: [{
						name: e.name,
						type: "value",
						max: e.max ? Number(e.max) : null,
						min: e.min ? Number(e.min) : null,
						boundaryGap: ['5%', '5%']
					}],
					series: {
						name: e.name,
						type: 'line',
						showSymbol: false,
						smooth: true,
						markArea: markArea,
						data: _sortBy(e.datas, 'date').map((time: any) => [proxy.$root.$moment(time.date).format('YYYY-MM-DD HH:mm:ss'), time.value.toFixed(2)])
					}
				})
			});
		};
		const handleSelect = (index: string | number) => {
			pageData.currentRoomName = _filter(
				pageData.roomList,
				(o: any) => o.roomNumber == index
			)[0].roomName;
			pageData.defaultActive = index;
			if (pageData.openNotice) {
				getNoticeAndChartFun();
			} else {
				queryRoomMonitorData(index);
			}
		}
		const searchAction = () => {
			if (pageData.openNotice) {
				getNoticeAndChartFun();
			} else {
				queryRoomMonitorData(pageData.defaultActive);
			}
		}
		const getLimit = (upperList: any) => {
			let upper = _filter(upperList, (u: any) => {
				return u.insPropCode.indexOf('TTHSET') != -1
			}).length > 0 ? _filter(upperList, (u: any) => {
				return u.insPropCode.indexOf('TTHSET') != -1
			})[0].value : null;
			let down = _filter(upperList, (u: any) => {
				return u.insPropCode.indexOf('TTLSET') != -1
			}).length > 0 ? _filter(upperList, (u: any) => {
				return u.insPropCode.indexOf('TTLSET') != -1
			})[0].value : null;
			return _compact([!!down ? parseInt(down) == down ? down + '℃' : down.toFixed(1) + '℃' : '-℃', !!upper ? parseInt(upper) == upper ? upper + '℃' : upper.toFixed(1) + '℃' : '-℃']).join(" 至 ")
		}
		onMounted(() => {
			queryRoomsList();
		})
		return {
			...toRefs(pageData),
			handleSelect,
			searchAction,
			handleEchart,
			getLimit,
			getNoticeAndChartFun,
			fix
		}
	}
})
</script>

<style lang="scss" scoped>
</style>
