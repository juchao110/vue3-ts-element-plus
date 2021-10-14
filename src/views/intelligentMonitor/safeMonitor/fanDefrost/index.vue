<template>
<div class="fan-defrost-page">
	<el-tabs type="border-card">
		<el-tab-pane :label="k" v-for="(i,k) in list" :key="k">
			<div class="content-box">
				<div class="replay-box-title mg-t-10">
					<p class="box-title" v-if="!i.showAlarm">冷风机实时状态</p>
					<template v-else>
						<p class="box-replay">冷风机回放状态</p>
						<el-tag class="mg-l-20" effect="dark" @click="returnToRealTime(k)">回到实时状态</el-tag>
					</template>
				</div>
				<el-card shadow="always" class="box-l">
					<template v-if="!i.showAlarm">
						<el-row :gutter="20">
							<el-col :span="12">
								<fieldset class="room-info" v-if="!!i.roomData">
									<legend>
										冷间
									</legend>
									<el-row :gutter="20">
										<el-col class="r-text" v-for="r in i.roomData.coolSafeRealTimeData" :key="r.name" :span="12">
											<span :class="{'alarm' : r.alarmFlag }" class="r-text">
												{{ r.name}} :
												<span v-if="isValue(r.realTimeValue)">{{fix(r.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ r.unit}}
											</span>
										</el-col>
									</el-row>
								</fieldset>
							</el-col>
							<el-col :span="12">
								<fieldset>
									<legend>
										冷风机
									</legend>
									<el-row :gutter="20">
										<el-col :span="12">
											<img :src="image" alt="">
										</el-col>
										<el-col :span="12" v-if="i.statisticData.length > 1">
											<el-select key="realTimeIndex" v-model="i.realTimeIndex">
												<el-option v-for="(o, index) in filterData(i.statisticData)" :key="index" :label="o.insPropName" :value="index"></el-option>
											</el-select>
											<p :class="{'alarm' : real.alarmFlag }" class="air-info" v-for="real in i.statisticData[i.realTimeIndex].coolSafeRealTimeData" :key="real.name">
												{{ real.name}} :
												<span v-if="isValue(real.realTimeValue)">{{fix(real.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ real.unit}}
											</p>
										</el-col>
									</el-row>
								</fieldset>
							</el-col>
						</el-row>
					</template>
					<template v-else>
						<div class="alarm-content">
							<p class="alarm">报警内容: {{ i.replayData.insAlarmName }}</p>
							<p class="alarm">报警时间: {{ i.replayData.alarmTime  | YYYYMMDDHHmmss }}</p>
						</div>
						<el-row :gutter="20">
							<el-col :span="12">
								<fieldset class="room-info">
									<legend>
										冷间
									</legend>
									<el-row :gutter="20" v-if="r.propCode == 'AUIT' || r.propCode == 'AUVT'">
										<el-col class="r-text" v-for="(r,index) in i.replayData.historyValues" :key="index" :span="12">
											<span :class="{'alarm' : r.alarmFlag }" class="r-text">
												{{ r.name}} :
												<span v-if="isValue(r.realTimeValue)">{{fix(r.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ r.unit}}
											</span>
										</el-col>
									</el-row>
								</fieldset>
							</el-col>
							<el-col :span="12">
								<fieldset>
									<legend>
										冷风机
									</legend>
									<el-row :gutter="20">
										<el-col :span="12">
											<img :src="image" alt="">
										</el-col>
										<el-col :span="12">
											<p :class="{'alarm' : r.alarmFlag }" v-if="r.propCode != 'AUIT' && r.propCode != 'AUVT'" class="air-info" v-for="(r,index) in i.replayData.historyValues" :key="index">
												{{ r.name}} :
												<span v-if="isValue(r.realTimeValue)">{{fix(r.realTimeValue,1)}}</span>
												<span v-else>--</span>
												{{ r.unit}}
											</p>
										</el-col>
									</el-row>
								</fieldset>
							</el-col>
						</el-row>
					</template>
				</el-card>
				<div class="replay-box-title mg-t-20">
					<p class="box-title">
						该冷风机的安全状况:
						<span class="alarm" v-if="i.coolSafeAlarmData.length">有{{ i.coolSafeAlarmData.length }}次报警</span>
						<span class="good" v-else>良好, 要继续保持，不要懈怠。</span>
					</p>
				</div>
				<div class="box-r">
					<el-table v-if="i.coolSafeAlarmData.length" :data="i.coolSafeAlarmData" border max-height="340px" header-cell-class-name="table-header-class">
						<el-table-column prop="insAlarmName" label="报警内容" align="center"></el-table-column>
						<el-table-column label="发生时间" align="center">
							<template slot-scope="scope">
								{{ scope.row.alarmTime | YYYYMMDDHHmmss }}
							</template>
						</el-table-column>
						<el-table-column label="报警回放" align="center">
							<template slot-scope="scope">
								<el-button type="text" @click="replayAction(k, scope.row)">
									<icon class="replay" name="replay" :w="30" :h="30"></icon>
								</el-button>
								<el-button type="text" @click="showTrendAsy(scope.row)">
									<icon class="monitor" name="monitor" :w="30" :h="30"></icon>
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<div class="params-box">
					<p class="params-title">参数极值统计</p>
					<div class="div-box table-header">
						<p class="first-c">项目</p>
						<div class="second-c">
							<div class="value-line none-bottom-line">
								<p class="c-2">参数名称</p>
								<div class="value-content">
									<p class="c-3">当前值</p>
									<div class="top-down">
										<p class="top">昨日</p>
										<div class="top-down-value">
											<p class="c-3-t">最高</p>
											<p class="c-3-d">最低</p>
										</div>
									</div>
									<div class="top-down">
										<p class="top">上月</p>
										<div class="top-down-value">
											<p class="c-3-t">最高</p>
											<p class="c-3-d">最低</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="div-box none-top-line" v-for="sData in i.statisticData" :key="sData.equipmentType">
						<p class="first-c">{{ sData.equipmentType }}</p>
						<div class="second-c">
							<div class="value-line" v-for="e in sData.coolSafeStatisticData" :key="e.propCode">
								<p class="c-2">{{ e.name }}
									<span v-if="!!e.unit">/{{e.unit}}</span>
								</p>
								<div class="value-content">
									<p class="c-3">
										<span v-if="isValue(e.realTimeValue)">{{fix(e.realTimeValue,1)}}</span>
										<span v-else>--</span>
									</p>
									<div class="top-down">
										<div class="top-down-value none-line">
											<p v-if="e.yesterdayMaxValue == 0 || !!e.yesterdayMaxValue" class="c-3-t">{{ fix(e.yesterdayMaxValue,1) }}</p>
											<p v-else class="c-3-t">--</p>
											<p v-if="e.yesterdayMinValue == 0 || !!e.yesterdayMinValue" class="c-3-d">{{ fix(e.yesterdayMinValue,1) }}</p>
											<p v-else class="c-3-d">--</p>
										</div>
									</div>
									<div class="top-down">
										<div class="top-down-value none-line">
											<p v-if="e.lastMonthMaxValue == 0 || !!e.lastMonthMaxValue" class="c-3-t">{{ fix(e.lastMonthMaxValue,1) }}</p>
											<p v-else class="c-3-t">--</p>
											<p v-if="e.lastMonthMinValue == 0 || !!e.lastMonthMinValue" class="c-3-d">{{ fix(e.lastMonthMinValue,1) }}</p>
											<p v-else class="c-3-d">--</p>
										</div>
									</div>
								</div>
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
	fanDefrost
} from '../interface';
import {
	queryCoolSafe
} from '@/api/safeMonitor/index';
import {
	_groupBy,
	_fromPairs,
	_cloneDeep,
	_compact,
	_find,
	_flatten,
	_sortBy,
	_filter
} from '@/utils/lodash';
import global from "@/utils/global";
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: fanDefrost = {
			list: {},
			alarmTrendList: [],
			showTrend: false,
			choosed: {
				time: []
			}
		};
		const image = require('@/assets/images/safe/aircooler.jpg');
		const pageData = reactive(obj);
		const {
			fix,
			formatDate
		}: any = global();
		const returnToRealTime = (k: string) => {
			pageData.list[k]['showAlarm'] = false;
		};
		const isValue = (v: any) => {
			if (v === 0 || !!v) {
				return true
			} else {
				false
			}
		};
		const replayAction = (k: string, row: any) => {
			pageData.list[k]['replayData'] = row;
			pageData.list[k]['showAlarm'] = true;
		};
		const getList = () => {
			queryCoolSafe({
				"modules": ["AU"],
				"projectId": state.common.currentProject.projectId,
				'projectUuid': state.common.currentProject.projectUuid,
				"isAuthorityOn": false
			}).then((res: any) => {
				var realTimeList: Array < any > = _groupBy(res.data.data.AU, 'roomName');
				pageData.list = _fromPairs(Object.keys(_cloneDeep(realTimeList)).map((k: any) => {
					let r: Array < any > = _cloneDeep(realTimeList[k]);
					let objRoom: any = {
						coolSafeAlarmData: _compact(_flatten(r.map((e: any) => {
							return e.coolSafeAlarmData
						}))),
						roomData: _find(r, (e: any) => {
							return e.equipmentType == '冷间'
						}),
						statisticData: _flatten([_find(r, (e: any) => {
							return e.equipmentType == '冷间'
						}), _sortBy(_filter(r, (e: any) => {
							return e.equipmentType != '冷间'
						}), 'equipmentType')]),
						realTimeIndex: 1,
						showAlarm: false,
						replayData: ''
					}
					return [k, objRoom]
				}));
			})
		};
		const filterData = (data: any) => {
			return _filter(data, (e: any) => e.equipmentType !== '冷间');
		};
		const showTrendAsy = (row: any) => {
			pageData.choosed = row;
			pageData.choosed['time'] = [row.alarmTime - 60 * 60 * 1000, row.alarmTime + 60 * 60 * 1000];
			pageData.showTrend = true;
		};
		onMounted(() => {
			getList();
		})
		return {
			...toRefs(pageData),
			returnToRealTime,
			image,
			isValue,
			replayAction,
			fix,
			filterData,
			showTrendAsy
		}
	}
})
</script>
