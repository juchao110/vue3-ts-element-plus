<template>
<div class="full-screen-single" style="padding-bottom:30px" element-loading-background="rgba(0, 0, 0, 0.8)" v-loading="loading">
	<div class="header">
		{{state.common.currentProject.projectName}}
	</div>
	<div class="body-content">
		<el-row :gutter="20" id="main-content" style="height:100%">
			<el-col :span="7" style="height:100%; width:30%" class="left">
				<div class="each-item" :style="{height:labelHeight*2+'px'}">
					<h4 class="blue-title">昨日各冷间电耗</h4>
					<Water :height="labelHeight" name="电耗(kWh)" :data="basic.roomEnergy" keyValue="energyConsumption" key="water"></Water>
				</div>
				<div class="each-item" :style="{height:labelHeight*2+'px'}">
					<h4 class="blue-title">前七日冷库电耗</h4>
					<EnergyLine :options="{
  						color: ['#7c2d94', '#ba1a57','#fff']
  					}" :key="2" keyValue="energy" :data="basic.energy" property="energyConsumption" :height="labelHeight*2-60"></EnergyLine>
				</div>
				<div class="each-item" :style="{height:labelHeight+'px'}">
					<h4 class="blue-title">今日冷库报警</h4>
					<Alarm :height="labelHeight" :data="basic.alarm"></Alarm>
				</div>
			</el-col>
			<el-col :span="10" style="height:100%;width:40%;" class="middle">
				<div class="time-content">

					<span style="position:absolute;right:0;top:-25px">{{formatDate(currentTime)}}</span>
				</div>
				<div class="room-temperature">
					<h4 class="blue-title mg-b-20" style="width:160px;margin:0 auto;">各冷间实时温度</h4>
					<el-carousel trigger="click" :height="labelHeight*2+'px'" indicator-position="outside">
						<el-carousel-item v-for="(item,index) in basic.roomTemperature" :key="index">
							<div class="room-list clearfloat" :class="{'big-icon':basic.roomTemperatureLength<5}">
								<el-tag class="each-tag l" @click="showHistoryLine(e)" :style="{height:`${basic.roomTemperatureLength<5?(labelHeight*2-80):(labelHeight-30)}px`}" :type="e.isTemperatureHasAlarm?'danger':'primary'" v-for="(e,eindex) in item"
									:key="eindex">

									<span class="room-name-span"><i class="iconfont" style="font-size:20px;font-weight:normal;color:#0ff">&#xe618;</i>{{e.roomName}}</span>
									<span class="room-value-span">{{fix(e.value,1)}} ℃</span>
								</el-tag>
							</div>
						</el-carousel-item>
					</el-carousel>
				</div>
				<div class="room-info" :style="{height:labelHeight*2+'px'}">
					<div style="height:100%">
						<h4 class="blue-title">冷库温区面积分布（单位：㎡）</h4>
						<div id="roomArea" :style="{height:labelHeight*2 - 40 +'px',width:roomWidth+'px'}"></div>
						<!-- <ve-pie ref="pieChart" :data="chartData" :settings="{
  							radius: 60,
  							offsetY: 120
  						}" :extend="{legend: {
  							show: false
  						},label:{
                  fontSize:12
              }}" :style="{height:labelHeight*2 - 40 +'px'}"></ve-pie> -->
					</div>
					<div class="room-eqiupment">
						<h4 class="blue-title">冷间风机运行状态</h4>
						<el-row>
							<el-col :span="12">&nbsp;</el-col>
							<el-col :span="4">&nbsp;</el-col>
							<el-col :span="4" style="text-align:center;">
								<i class="iconfont status-on">&#xe643;</i>
							</el-col>
							<el-col :span="4" style="text-align:center;">
								<i class="iconfont status-off">&#xe63c;</i>
							</el-col>
						</el-row>
						<el-carousel indicator-position="outside" :height="labelHeight*1.2+'px'">
							<el-carousel-item v-for="(room,index) in basic.roomRuning" :key="index">
								<el-row class="each-room" v-for="(item,eindex) in room" :key="eindex">
									<el-col :span="12">{{item.roomName}}</el-col>
									<el-col :span="4">
										<i class="iconfont" @click="moreEquip(item.videoDataList)" style="cursor:pointer">&#xe620;</i>
									</el-col>
									<el-col :span="4" style="text-align:center">{{item.runningCount}}</el-col>
									<el-col :span="4" style="text-align:center">{{item.stopCount}}</el-col>
								</el-row>
							</el-carousel-item>
						</el-carousel>
					</div>
				</div>
			</el-col>
			<el-col :span="7" style="height:100%;width:30%" class="right">
				<div class="each-item" :style="{height:labelHeight*2+'px'}">
					<h4 class="blue-title">昨日冷间温度达标率</h4>
					<Grid :height="labelHeight" :data="basic.temperature.roomData" :type="basic.temperature.projectId"></Grid>
				</div>
				<div class="each-item" :style="{height:labelHeight*2+'px'}">
					<h4 class="blue-title">今日库门超时开提醒</h4>
					<Door :height="labelHeight" :room="basic.doorRoomList" type="room" :data="basic.door"></Door>
				</div>
				<div class="each-item" :style="{height:labelHeight+'px'}">
					<h4 class="blue-title">前七日天气</h4>
					<div class="weather-info">
						<div style="width:14%" v-for="(w,index) in basic.weather" :key="index">
							<p>{{formatDate(w.timestamp,'MM-DD')}}</p>
							<p>{{w.dayWeather}}</p>
							<p>{{w.minTemperature}}~{{w.maxTemperature}}℃</p>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-dialog custom-class="line-dialog" v-model="lineDialog" :modal-append-to-body="false" :show-close="false" width="40%" :before-close="handleClose">
			<p class="dialog-title">{{currentRoomName}}--过去24小时温度曲线</p>
			<LineChart :data="trendData" name="temp"></LineChart>
			<div class="button-list">
				<el-button type="primary" @click="handleDialogClose">关 闭</el-button>
			</div>
		</el-dialog>
	</div>
</div>
</template>
<script lang='ts'>
import {
	getCurrentInstance,
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	computed,
	nextTick,
	onUnmounted
} from 'vue';
import {
	useStore
} from 'vuex';
import Alarm from './alarm.vue';
import Weather from './weather.vue';
import Grid from './grid.vue';
import Door from './door.vue';
import Water from './water.vue';
import Energy from './energy.vue';
import EnergyLine from './energyLine.vue';
import LineChart from './lineChart.vue';
import {
	queryYHSingleProjectScreen,

} from '@/api/intelligentMonitor/index';
import {
	trendAnalysis
} from "@/api/paramsMonitor/index";
import '@/assets/scss/intelligentMonitor/screen.scss';
import {
	_chunk,
	_sortBy,
	_groupBy,
	_sum
} from '@/utils/lodash';
import global from '@/utils/global';
export default defineComponent({
	props: {
		height: {
			type: Number,
			default: () => 0
		}
	},
	components: {
		Alarm,
		Weather,
		Grid,
		Door,
		Water,
		Energy,
		EnergyLine,
		LineChart,
	},
	setup(props: any, {
		emit
	}: any) {
		const store = useStore();
		const state = store.state;
		const {
			fix,
			formatDate
		}: any = global();
		const {
			proxy
		}: any = getCurrentInstance();
		const pageData: any = reactive({
			asset: {
				on: require('@/assets/images/fullScreen/room_03.png'),
				off: require('@/assets/images/fullScreen/room_02.png'),
				equip: require('@/assets/images/fullScreen/room_01.png'),
				home: require('@/assets/images/fullScreen/room_04.png')
			},
			loading: false,
			currentTime: new Date().getTime(),
			basic: {
				asset: {
					areaValueList: [],
					areaValueNewList: []
				},
				alarm: [],
				door: [],
				doorRoomList: [],
				weather: [],
				temperature: [],
				energy: [],
				water: [],
				roomEnergy: [],
				roomTemperature: [],
				roomTemperatureLength: 0,
				roomRuning: []
			},
			trendData: [],
			lineDialog: false,
			currentRoomName: ''
		})
		const timer = setInterval(() => {
			pageData.currentTime = new Date().getTime()
		}, 1000);
		const labelHeight = computed(() => ((props.height - 40) / 5 - 25))
		const roomWidth = window.innerWidth * 0.4 * 0.4 - 30;
		const queryYHSingleProjectScreenFun = () => {
			queryYHSingleProjectScreen({
				projectUuid: state.common.currentProject.projectUuid,
				projectId: state.common.currentProject.projectId,
			}).then((res: any) => {
				const response = res.data.data
				pageData.basic.alarm = response.YH_ALARM;
				pageData.basic.weather = response.WEATHER.length != 0 ? _sortBy(response.WEATHER[0].lastSevenDaysWeather, 'timestamp') : [];
				pageData.basic.temperature = response.YH_TEMPERATURE_NORMAL_PERCENT.length != 0 ? response.YH_TEMPERATURE_NORMAL_PERCENT[0] : [];
				pageData.basic.door = response.YH_DOOR_ALARM.length != 0 ? response.YH_DOOR_ALARM[0].isRoomHasAlarm : [];
				pageData.basic.doorRoomList = response.YH_DOOR_ALARM.length != 0 ? response.YH_DOOR_ALARM[0].alarmInfo : [];
				pageData.basic.energy = response.YH_ENERGY_EFFICIENT_TENDENCY.length != 0 ? response.YH_ENERGY_EFFICIENT_TENDENCY[0].lastSevenDaysEnergy : [];
				pageData.basic.water = response.YH_WATER_TENDENCY.length != 0 ? response.YH_WATER_TENDENCY[0] : [];
				pageData.basic.roomEnergy = response.YH_ROOM_ENERGY_TENDENCY
				pageData.basic.roomTemperature = response.YH_TEMPERATURE.length != 0 ? _chunk(response.YH_TEMPERATURE[0].info, 8) : [];
				pageData.basic.roomTemperatureLength = response.YH_TEMPERATURE.length != 0 ? response.YH_TEMPERATURE[0].info.length : 0;
				pageData.basic.roomRuning = _chunk(response.YH_CRUN_RUNNING_STATE, 4);

				const group = _groupBy(pageData.basic.asset.areaValueList, 'projectName');
				pageData.basic.asset['areaValueNewList'] = Object.keys(group).map((k: any) => {
					return {
						projectName: k,
						area: _sum(group[k].map((e: any) => e.value))
					}
				})
				area(response.AREAR_DISTRIBUTION);
				emit('ready', true);
			})
		};
		const area = async (data: any) => {
			await nextTick();
			const chart = proxy.$root.$echarts.init(document.getElementById('roomArea'));
			chart.clear();
			chart.setOption({
				tooltip: {
					trigger: 'item'
				},
				series: [{
					name: '面积',
					type: 'pie',
					radius: '40%',
					data: data.map((e: any) => {
						return {
							value: e.areaValue,
							name: e.roomType
						}
					}),
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}]
			})
		};
		const showHistoryLine = (item: any) => {
			pageData.loading = true;
			pageData.currentRoomName = item.roomName;
			store.commit('common/HANDLECAROUSEL', false);
			trendAnalysis([{
				endDateTime: new Date().getTime(),
				metric: item.metric,
				pointCode: item.insPropcode,
				startDateTime: new Date().getTime() - 86400000
			}]).then((res: any) => {
				pageData.trendData = res.data.data.map((e: any) => {
					return {
						date: e.dateTime,
						...e
					}
				})
				pageData.loading = false;
				pageData.lineDialog = true;
			}).catch(err => {
				pageData.loading = false;
				store.commit('common/HANDLECAROUSEL', true);
			})
		};
		const handleDialogClose = () => {
			pageData.lineDialog = false;
			store.commit('common/HANDLECAROUSEL', true);

		}
		queryYHSingleProjectScreenFun();
		onMounted(() => {
			timer;
		})
		onUnmounted(() => {
			clearInterval(timer)
		})
		return {
			...toRefs(pageData),
			...props,
			labelHeight,
			state,
			fix,
			formatDate,
			showHistoryLine,
			handleDialogClose,
			roomWidth
		}
	}
})
</script>
