<template lang="html">
  <div class="cabin-home-page">
    <div class="notice-list" v-if="noticeList.length!=0" style="height:30px;margin-bottom: 15px">
      <NoticeBar :options='options' type="list" :data="noticeList"></NoticeBar>
    </div>
    <el-row>
      <el-col :span="20">
        <div class="map-title">
          冷库组态
          <span @click="showFull">全屏</span>
        </div>
        <iframe v-if="url" :src="url" width="100%" style="height:calc(100% - 50px)"></iframe>
    	   <h4 v-else>暂无组态图</h4>
      </el-col>
      <el-col style="width:18%;" :span="4"  class="equip-status">
				<div class="border-content">
					<div class="map-title">
						DTC设备状态
					</div>
					<div class="tag">
						<el-tag style="width:80px;height: 80px" size="large">
							<i class="el-icon-s-platform" style="font-size: 25px"></i>
							<h4>{{equipStatus.onlineCount + equipStatus.offlineCount}}</h4>
						</el-tag>
						<h5>设备总和</h5>
					</div>
					<div class="tag">
						<el-tag style="width:80px;height: 80px" type="success" size="large">
              <i class="iconfont" style="font-size: 25px">&#xe619;</i>
							<h4>{{equipStatus.onlineCount}}</h4>
						</el-tag>
						<h5>在线设备</h5>
					</div>
					<div class="tag">
						<el-tag style="width:80px;height: 80px" type="danger" size="large">
              <i class="iconfont" style="font-size: 25px">&#xe617;</i>
							<h4>{{equipStatus.offlineCount}}</h4>
						</el-tag>
						<h5>离线设备</h5>
					</div>
				</div>
        <div class="alarm-list">
          <div class="map-title">
						过去24小时报警
					</div>
          <ul>
            <li v-for="(alarm,index) in alarmList" :key="index" @click="showTrendAction(alarm)">
              <i :style="getStyle(alarm.alarmType)" class="iconfont">&#xe64f;</i>
              <span class="alarm-time">{{formatDate(alarm.alarmTime)}}</span>
              <span class="alarm-name">{{alarm.alarmName}}</span>
            </li>
          </ul>
        </div>
			</el-col>
    </el-row>
    <div class="energy-info mg-t-20"  v-loading="energyLoad">
    		<p class="title-name">昨日单位能耗排行榜</p>
    		<template v-if="energyRankingList.length > 0">
    			<div class="energy-list mg-b-10 clearfloat">
    				<ul class="mg-t-20">
    					<li v-for="energy in energyRankingList" :key="energy.roomType" >
    						<span>{{energy.roomType}}单位能耗: </span><span>{{tofixValue(energy.perProjectRoomTypeEnergyData)}} kWh/m²</span>
    					</li>
    				</ul>
    			</div>
    			<div class="down-box clearfloat">
    				<el-carousel height="180px" :interval="300000">
    					<el-carousel-item v-for="(l,index) in energyRateList" :key="index">
    						<ul class="dowm-list">
    							<li v-for="r in l" :key="r.roomType">
    								<p class="header">单位能耗低于</p>
    								<p class="percent">{{r.projectEnergyRoomTypeRate }}%</p>
    								<i class="iconfont energyi">&#xe607;</i>
    								<p class="projectName">{{ r.roomType }}</p>
    							</li>
    						</ul>
    					</el-carousel-item>
    				</el-carousel>
    			</div>
    		</template>
    		<div v-else class="nodata">
    			该库无昨日能耗数据
    		</div>

    	</div>
      <el-dialog :title="choosed.alarmName" v-model="showTrend" width="60%">
    		<Trend :time="choosed.time" :pointCode="choosed.insPropCode" :pointName="choosed.alarmName" :metric="choosed.metric"></Trend>
    		<template #footer>
    			<span class="dialog-footer">
    				<el-button @click="showTrend = false">取 消</el-button>
    				<el-button type="primary" @click="showTrend = false">确 定</el-button>
    			</span>
    		</template>
    	</el-dialog>
  </div>
</template>

<script lang="ts">
import 'element-plus/dist/index.css';
import {
	queryNotice,
	queryConfiguration,
	queryEquipmentStatusData,
	queryEnergyRanking,
	query24HourProjectAlarm
} from '@/api/intelligentMonitor/index';
import NoticeBar from './components/noticeBar.vue';
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	onMounted,
} from "vue";
import {
	useStore
} from "vuex";
import {
	_compact,
	_chunk
} from '@/utils/lodash';
import global from '@/utils/global';
import {
	home
} from '../interface';
export default defineComponent({
	components: {
		NoticeBar
	},
	setup() {
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			formatDate
		}: any = global();
		const store = useStore();
		const state = store.state;
		const obj: home = {
			noticeList: [],
			equipStatus: {},
			options: {
				size: '14px', // 通知内容文字大小（默认16px）
				color: '#FF0000', // 通知内容文字颜色(默认#f60)
				background: '#F4C2C2', //背景颜色(默认#fff7cc)
				delay: '500', // 动画延迟时间(默认一秒后开始滚动，单位毫秒)
				speed: '30' // 滚动速率默认50 (px/s)
			},
			url: '',
			energyRankingList: [],
			energyRateList: [],
			energyLoad: true,
			alarmList: [],
			choosed: {},
			showTrend: false
		};
		const data = reactive(obj);
		const tofixValue = (energy: any) => {
			const value = energy ? parseFloat(energy) : energy;
			return value ? !parseFloat(value) ? value : value.toFixed(2) == 0 ? value.toFixed(4) : value.toFixed(2) : value == null ? '-' : value;
		};
		const getEnergy = () => {
			data.energyLoad = true;
			var nowDate = new Date();
			var yesterday = new Date(nowDate.getTime() - 86400 * 1000);
			queryEnergyRanking({
				dayType: 'day',
				projectId: state.common.currentProject.projectId,
				startTime: new Date(`${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()} 00:00:00`).getTime(),
				endTime: new Date(`${nowDate.getFullYear()}-${nowDate.getMonth()+1}-${nowDate.getDate()} 00:00:00`).getTime(),
			}).then((res: any) => {
				data.energyLoad = false;
				let resData = res.data.data;
				if (!!resData.perProjectEnergyData || !!resData.energyRankingRoomTypeResponseList) {
					let arr: any = [{
						'perProjectRoomTypeEnergyData': resData.perProjectEnergyData,
						'roomType': '冷库'
					}, ...resData.energyRankingRoomTypeResponseList]
					data.energyRankingList = arr;
				}
				let rateArr: any = _chunk([{
						roomType: '全国冷库',
						projectEnergyRoomTypeRate: resData.projectEnergyCountryRate
					},
					{
						roomType: resData.region + '区冷库',
						projectEnergyRoomTypeRate: resData.projectEnergyRegionRate
					},
					{
						roomType: resData.proTypeName + '类冷库',
						projectEnergyRoomTypeRate: resData.projectEnergyTypeRate
					},
					...resData.energyRankingCryogenResponseList.map((e: any) => {
						return {
							roomType: e.cryogen + '冷库',
							projectEnergyRoomTypeRate: e.projectEnergyCryogenRate
						}
					}),
					...resData.energyRankingRoomTypeResponseList
				], 7)
				data.energyRateList = rateArr;
			}).catch(() => {
				data.energyLoad = false;
			})
		};
		const getAlarm = () => {
			query24HourProjectAlarm({
				projectCode: state.common.currentProject.projectId
			}).then((res: any) => {
				data.alarmList = res.data.data;
			})
		};
		const getLevel = (l: string) => {
			return l.substr(6, 1);
		};
		const getStyle = (l: string) => {
			if (getLevel(l) === '1') return 'color:#0b6';
			if (getLevel(l) === '2') return 'color:#fd0';
			if (getLevel(l) === '3') return 'color:#f00';
		};
		const showTrendAction = (item: any) => {
			data.choosed = item;
			data.choosed.time = [item.alarmTime - 60 * 60 * 1000, item.alarmTime + 60 * 60 * 1000];
			data.showTrend = true;
		};
		const showFull = () => {
			window.open(data.url);
		};
		onMounted(() => {
			getAlarm();
			queryNotice({
				proId: state.common.currentProject.projectId,
				currentTime: new Date().getTime()
			}).then((res: any) => {
				data.noticeList = _compact(res.data.data.map((n: any, index: string) => {
					var solveString = !!n.solveTime ? proxy.$root.$moment(n.solveTime).format("YYYY-MM-DD HH:mm") : null;
					solveString = n.rentState == 1 ? '招租中' : solveString;
					solveString = n.ensureState == 1 ? '待确认' : solveString;
					return {
						...n,
						text: `重要通知：${n.proAliasName}
			        ${proxy.$root.$moment(n.startTime).format("YYYY-MM-DD HH:mm")}
			        ${n.noticeTypeName}
			        ${n.noticeType == '3' ? `(${n.proSysName})` : ''}
			        ${n.noticeType == '4' ? `(${n.roomName})` : ''},
							恢复时间：${solveString}`
					}
				}));
			});
			queryConfiguration({
				client: 0,
				forTenant: 0,
				projectId: state.common.currentProject.projectId
			}).then((res: any) => {
				data.url = res.data.data.zutaiRequestUrl
			});
			queryEquipmentStatusData({
				projectIds: [state.common.currentProject.projectId]
			}).then((res: any) => {
				if (res.data.data.length != 0) data.equipStatus = res.data.data[0];
			});
			getEnergy();

		})
		return {
			...toRefs(data),
			tofixValue,
			formatDate,
			getStyle,
			showTrendAction,
			showFull
		}
	}
})
</script>

<style lang="scss">
@import '@/assets/scss/common.scss';
.cabin-home-page {
    .notice-list {
        height: 30px;
        width: 100%;
    }
    .map-title {
        @include padding_l(15px);
        border-left: 5px solid $primaryColor;
        margin: 15px 0;
        position: relative;
        span {
            position: absolute;
            right: 10px;
            top: 0;
            cursor: pointer;
            &:hover {
                color: $primaryColor;
            }
        }
    }
    .el-row {
        height: 750px;
        @include margin_b(15px);
        .el-col {
            height: 100%;
            iframe {
                border: none;
            }
        }
        .alarm-list {
            display: block;
            height: 326px;
            margin-left: 5px;
            border: 1px solid #e8ecf6;
            /*box-shadow: #f2f2f2 0 0 4px 2px;*/
            @include border_radius(3px);
            @include padding(5px);
            overflow: hidden;
            background: $whiteColor;
            ul {
                height: 276px;
                overflow: scroll;
                overflow-x: hidden;
                li {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    @include margin_b(5px);
                    cursor: pointer;
                    &:hover {
                        color: $primaryColor;
                    }
                }
            }
        }
    }
    .equip-status {
        height: 402px;

        .border-content {
            width: calc(100% - 10px);
            margin-left: 5px;
            @include margin_b(20px);
            border: 1px solid #e8ecf6;
            background: $whiteColor;
            /*box-shadow: #f2f2f2 0 0 4px 2px;*/
            @include border_radius(3px);
            p {
                text-align: center;
                font-weight: bold;
                font-size: 20px;
                line-height: 80px;
            }
            & > .tag {
                text-align: center;
                @include margin_t(10px);
                @include margin_b(10px);
                h5 {
                    font-weight: normal;
                    @include margin_t(10px);
                }
                .el-tag {
                    padding: 10px 20px;
                    h4 {
                        font-size: 16px;
                        font-weight: bold;
                        height: 30px;
                        line-height: 30px;
                        text-align: center;
                    }

                }
            }
        }

    }
    .energy-info {
        width: calc(100% - 10px);
        margin-left: 5px;
        border: 1px solid #e8ecf6;
        /*box-shadow: #f2f2f2 0 0 4px 2px;*/
        @include border_radius(3px);
        background: $whiteColor;
        .title-name {
            @include padding_l(15px);
            border-left: 5px solid $primaryColor;
            margin: 15px 0;
        }
        .energy-list {
            @include padding_l(15px);
            @include padding_r(15px);
            @include margin_l(15px);
            @include margin_r(15px);
            border: 1px solid #e7ecf8;
            ul {
                li {
                    @include margin_t(10px);
                    @include margin_b(10px);
                    float: left;
                    width: 25%;
                    font-size: 14px;

                    span:nth-child(2) {
                        color: red;
                    }
                }
            }
        }
        .down-box {
            @include padding_l(15px);
            @include padding_r(15px);
            overflow: hidden;
            position: relative;

            ul.dowm-list {
                position: relative;
                overflow: hidden;
                width: 100%;

                li {
                    float: left;
                    width: 13.9%;
                    height: 180px;
                    display: block;
                    text-align: center;
                    .header {
                        font-size: 14px;
                        line-height: 30px;
                        color: #666;
                    }
                    .percent {
                        font-size: 24px;
                        font-weight: 500;
                        color: #F3A43B;
                    }
                    .energyi {
                        color: #F3A43B;
                        font-size: 35px;
                    }
                    .img-up {
                        width: 50px;
                    }
                    .projectName {
                        white-space: wrap;
                        line-height: 30px;
                        font-size: 14px;
                        font-weight: 500;
                        color: #F3A43B;
                    }
                }
            }
        }
        .nodata {
            border-top: 1px solid #f2f2f2;
            text-align: center;
            @include padding(15px);
        }
    }
}
</style>
