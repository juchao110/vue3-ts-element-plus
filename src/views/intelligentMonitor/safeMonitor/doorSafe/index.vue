<template>
<div class="door-safe-page">
	<el-tabs type="border-card" v-if="Object.keys(list).length > 0">
		<el-tab-pane :label="k" v-for="(d,k) in list" :key="k">
			<div class="list">
				<div class="item clearfloat" v-for="(i, index) in d" :key="index">
					<h3>{{ i.insPropName }}</h3>
					<div class="content-box">
						<div class="box-l">
							<el-card shadow="always">
								<template v-if="!i.showAlarm">
									<div class="replay-box-title">
										<p class="box-title">库门实时状态</p>
									</div>
									<div class="img-content">
										<div v-for="(m,index) in i.coolSafeRealTimeData" :key="index">
											<p :class="{'alarm' : m.alarmFlag == true}" v-if="m.propCode === 'DOORHEATERTT'">
												{{ m.name}} :
												<span v-if="isValue(m.realTimeValue)">{{fix(m.realTimeValue,1) }}</span>
												<span v-else>--</span>
												{{ m.unit}}
											</p>
										</div>
										<img class="img" :src="getSrc(i, i.coolSafeRealTimeData)" alt="">
										<div v-for="(m,index) in i.coolSafeRealTimeData" :key="index">
											<p :class="{'alarm' : m.alarmFlag == true}" v-if="m.propCode === 'GROUNDHEATERTT'">
												{{ m.name}} :
												<span v-if="isValue(m.realTimeValue)">{{fix(m.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ m.unit}}
											</p>
										</div>
									</div>
									<div v-for="(m,index) in i.coolSafeRealTimeData" :key="index">
										<p v-if="m.propCode != 'DOORHEATERTT' && m.propCode != 'GROUNDHEATERTT' && m.propCode != 'SWITCH'">
											{{ m.name}} :
											<span v-if="isValue(m.realTimeValue)">{{fix(m.realTimeValue,1)}}</span>
											<span v-else>--</span>
											{{ m.unit}}
										</p>
									</div>
								</template>

								<template v-else>
									<div class="replay-box-title">
										<p class="box-title" style="color: #CD180F;">库门回放状态</p>
										<el-tag effect="dark" @click="returnToRealTime(k,index)">回到实时状态</el-tag>
									</div>
									<p class="alarm">报警内容: {{ i.replayData.insAlarmName }}</p>
									<p>报警时间: {{ formatDate(i.replayData.alarmTime)}}</p>
									<div class="img-content">
										<div v-for="(m,index) in i.replayData.historyValues" :key="index">
											<p :class="{'alarm' : m.alarmFlag == true}" v-if="m.propCode === 'DOORHEATERTT'">
												{{ m.name}} :
												<span v-if="isValue(m.realTimeValue)">{{fix(m.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ m.unit}}
											</p>
										</div>
										<img class="img" :src="getSrc(i, i.replayData.historyValues)" alt="">
										<div v-for="(m,index) in i.replayData.historyValues" :key="index">
											<p :class="{'alarm' : m.alarmFlag == true}" v-if="m.propCode == 'GROUNDHEATERTT'">
												{{ m.name}} :
												<span v-if="isValue(m.realTimeValue)">{{fix(m.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ m.unit}}
											</p>
										</div>
									</div>
									<div v-for="(m,index) in i.replayData.historyValues" :key="index">
										<p v-if="m.propCode != 'DOORHEATERTT' && m.propCode != 'GROUNDHEATERTT' && m.propCode != 'SWITCH'">
											{{ m.name}} :
											<span v-if="isValue(m.realTimeValue)">{{fix(m.realTimeValue,1)}}</span>
											<span v-else>--</span>
											{{ m.unit}}
										</p>
									</div>
								</template>
							</el-card>
						</div>
						<div class="box-r">
							<p>
								该库门最近一年的安全状况:
								<span class="alarm" v-if="i.coolSafeAlarmData.length">有{{ i.coolSafeAlarmData.length }}次报警</span>
								<span class="good" v-else>良好</span>
							</p>
							<el-table v-if="i.coolSafeAlarmData.length" :data="i.coolSafeAlarmData" border max-height="150px" header-cell-class-name="table-header-class">
								<el-table-column prop="insAlarmName" label="报警内容" align="center"></el-table-column>
								<el-table-column label="发生时间" align="center">
									<template #default="scope">
										{{ formatDate(scope.row.alarmTime)}}
									</template>
								</el-table-column>
								<el-table-column label="报警回放" align="center">
									<template #default="scope">
										<el-button type="text" @click="replayAction(k, index, scope.row)">
											<i class="iconfont">&#xe6a8;</i>
										</el-button>
										<el-button type="text" @click="showTrendAsy(scope.row)">
											<i class="iconfont">&#xe655;</i>
										</el-button>
									</template>
								</el-table-column>
							</el-table>
							<div class="good" v-else>
								状况良好要继续保持，不要懈怠
							</div>
							<div class="table-div">
								<p class="table-header-class">参数极值统计</p>
								<el-table :data="i.coolSafeStatisticData" style="width: 100%">
									<el-table-column label="参数名称" align="center">
										<template #default="scope">
											{{scope.row.name}}
											<span v-if="!!scope.row.unit">/{{scope.row.unit}}</span>
										</template>
									</el-table-column>
									<el-table-column label="当前值" align="center">
										<template #default="scope">
											<span v-if="scope.row.realTimeValue == 0 || !!scope.row.realTimeValue">{{ fix(scope.row.realTimeValue,1)}}</span>
											<span v-else>--</span>
										</template>
									</el-table-column>
									<el-table-column label="昨日" align="center">
										<el-table-column label="最高" align="center">
											<template #default="scope">
												<span v-if="scope.row.yesterdayMaxValue == 0 || !!scope.row.yesterdayMaxValue">{{ fix(scope.row.yesterdayMaxValue,1)}}</span>
												<span v-else>--</span>
											</template>
										</el-table-column>
										<el-table-column label="最低" align="center">
											<template #default="scope">
												<span v-if="scope.row.yesterdayMinValue == 0 || !!scope.row.yesterdayMinValue">{{ fix(scope.row.yesterdayMinValue,1)}}</span>
												<span v-else>--</span>
											</template>
										</el-table-column>
									</el-table-column>
									<el-table-column label="上月" align="center">
										<el-table-column label="最高" align="center">
											<template #default="scope">
												<span v-if="scope.row.lastMonthMaxValue == 0 || !!scope.row.lastMonthMaxValue">{{ fix(scope.row.lastMonthMaxValue,1)}}</span>
												<span v-else>--</span>
											</template>
										</el-table-column>
										<el-table-column label="最低" align="center">
											<template #default="scope">
												<span v-if="scope.row.lastMonthMinValue == 0 || !!scope.row.lastMonthMinValue">{{ fix(scope.row.lastMonthMinValue,1)}}</span>
												<span v-else>--</span>
											</template>
										</el-table-column>
									</el-table-column>
								</el-table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</el-tab-pane>
	</el-tabs>
	<el-dialog title="测点趋势" v-model="showTrend" width="60%">
		<Trend :time="choosed.time" :pointCode="choosed.insPropCode" :pointName="choosed.insAlarmName" :metric="choosed.metric"></Trend>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="showTrend = false">取 消</el-button>
				<el-button type="primary" @click="showTrend = false">确 定</el-button>
			</span>
		</template>
	</el-dialog>
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
	queryCoolSafe
} from '@/api/safeMonitor/index';
import {
	_sortBy,
	_groupBy,
	_filter,
	_find
} from '@/utils/lodash';
import {
	doorSafe
} from '../interface';
import global from "@/utils/global";

export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: doorSafe = {
			realTimeList: [],
			list: [],
			alarmTrendList: [],
			showTrend: false,
			choosed: {
				time: []
			}
		};
		const pageData = reactive(obj);
		const {
			fix,
			formatDate
		}: any = global();
		const getList = () => {
			queryCoolSafe({
				"modules": ["DOOR"],
				"projectId": state.common.currentProject.projectId,
				"isAuthorityOn": false
			}).then((res: any) => {
				if (res.data.data.DOOR) {
					pageData.list = _groupBy(_sortBy(res.data.data.DOOR.map((e: any) => {
						return {
							...e,
							showAlarm: false,
							replayData: '',
						}
					}), 'roomName'), 'roomName');
					pageData.realTimeList = _groupBy(res.data.data.DOOR, 'roomName');
				} else {
					pageData.list = [];
					pageData.realTimeList = [];
				}
			})
		};
		const isValue = (v: any) => {
			if (v === 0 || !!v) {
				return true
			} else {
				false
			}
		};
		const returnToRealTime = (k: any, index: any) => {
			pageData.list[k][index]['showAlarm'] = false;
		};
		const replayAction = (k: any, index: any, row: any) => {
			pageData.list[k][index]['replayData'] = row;
			pageData.list[k][index]['showAlarm'] = true;
		};
		const showTrendAsy = (row: any) => {
			pageData.choosed = row;
			pageData.choosed['time'] = [row.alarmTime - 60 * 60 * 1000, row.alarmTime + 60 * 60 * 1000];
			pageData.showTrend = true;
		};
		const getSrc = (i: any, Arr: any) => {
			let imgStr: string = '';
			// 库门关
			let openStatus: any = !!_find(Arr, (e: any) => {
				return e.propCode == 'SWITCH' && !e.realTimeValue
			})
			// 处理后缀，电加热故障，地面加热故障还是全故障
			let strArr: any = [...new Set(_filter(Arr, (e: any) => {
				return e.alarmFlag && (e.propCode == 'DOORHEATERTT' || e.propCode == 'GROUNDHEATERTT')
			}).map((i: any) => {
				return i.propCode
			}))]

			if (!openStatus && i.equipmentType !== '快速卷帘门') { // 库门开处理
				imgStr = 'DASopen';
			} else if (!openStatus && i.equipmentType == '快速卷帘门') {
				imgStr = 'Kopen';
			} else if (openStatus && (i.equipmentType === '单开平移门' || i.equipmentType === '安全门')) { // 库门关
				imgStr = 'DAclose';
			} else if (openStatus && i.equipmentType === '快速卷帘门') {
				imgStr = `Kclose`
			} else if (openStatus && i.equipmentType === '双开平移门') {
				imgStr = `Sclose`
			} else {
				imgStr = 'DAclose'
			}
			if (strArr.length == 2) {
				imgStr = imgStr + 'All.jpg';
			} else if (strArr.length == 1) {
				imgStr = imgStr + strArr[0] + '.jpg';
			} else {
				imgStr = imgStr + 'Normal.jpg';
			}
			return require('@/assets/images/safe/' + imgStr);
		};
		onMounted(() => {
			getList();
		})
		return {
			...toRefs(pageData),
			isValue,
			returnToRealTime,
			getSrc,
			replayAction,
			showTrendAsy,
			fix,
			formatDate
		}
	}
})
</script>
