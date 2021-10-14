<template>
<div class="pipe-heat-page">
	<el-tabs type="border-card">
		<el-tab-pane :label="l.roomName" v-for="(l, index) in list" :key="index">
			<div class="replay-box-title mg-b-10">
				<p class="box-title" v-if="!l.showAlarm">排水管实时状态</p>
				<template v-else>
					<p class="box-replay">排水管电加热回放状态</p>
					<el-tag class="mg-l-20" effect="dark" @click="returnToRealTime(index)">回到实时状态</el-tag>
				</template>
			</div>
			<el-card shadow="always">
				<el-row :gutter="20">
					<el-col :span="7">
						<div class="img-box">
							<img width="100%" :src="image" alt="">
							<h4>排水管电加热示意图</h4>
						</div>
					</el-col>
					<el-col :span="15">
						<div class="real-box">
							<template v-if="!l.showAlarm">
								<ul class="clearfloat">
									<li v-for="c in l.coolSafeRealTimeData" :key="c.name">
										<p :class="{'alarm' : c.alarmFlag}" class="name">{{ c.name }}</p>
										<p v-if="c.propCode.indexOf('CONALARM') == -1" :class="{'alarm' : c.alarmFlag}" class="value">
											<span v-if="isValue(c.realTimeValue)">{{fix(c.realTimeValue,1)}}</span>
											<span v-else>--</span>
											{{ c.unit}}
										</p>
										<p v-else>
											<i v-if="c.realTimeValue !== null" class="el-icon-switch-button" :style="getStyle(c)"></i>
											<span v-else>--</span>
										</p>
									</li>
								</ul>
							</template>

							<template v-else>
								<ul class="clearfloat">
									<p class="alarm">报警内容: {{ l.replayData.insAlarmName }}</p>
									<p class="alarm mg-t-20 mg-b-20">报警时间: {{ formatDate(l.replayData.alarmTime) }}</p>
									<li :span="12" v-for="(c,cindex) in l.replayData.historyValues" :key="cindex">
										<p :class="{'alarm' : c.alarmFlag}" class="name">{{ c.name }}</p>
										<p v-if="c.propCode.indexOf('CONALARM') == -1" :class="{'alarm' : c.alarmFlag}" class="value">
											<span v-if="isValue(c.realTimeValue)">{{fix(c.realTimeValue,1)}}</span>
											<span v-else>--</span>
											{{ c.unit}}
										</p>
										<p v-else>
											<i v-if="c.realTimeValue !== null" class="el-icon-switch-button" :style="getStyle(c)"></i>
											<span v-else>--</span>
										</p>
									</li>
								</ul>
							</template>
						</div>
					</el-col>
				</el-row>
			</el-card>
			<div class="box-r mg-t-20">
				<p class="mg-b-10">
					该排水管的安全状况:
					<span class="alarm" v-if="l.coolSafeAlarmData.length">有{{ l.coolSafeAlarmData.length }}次报警</span>
					<span class="good" v-else>良好，要继续保持，不要懈怠。</span>
				</p>
				<el-table v-if="l.coolSafeAlarmData.length" :data="l.coolSafeAlarmData" border max-height="150px" header-cell-class-name="table-header-class">
					<el-table-column prop="insAlarmName" label="报警内容" align="center"></el-table-column>
					<el-table-column label="发生时间" align="center">
						<template #default="scope">
							{{ formatDate(scope.row.alarmTime) }}
						</template>
					</el-table-column>
					<el-table-column label="报警回放" align="center">
						<template #default="scope">
							<el-button type="text" @click="replayAction(index, scope.row)">
								<icon class="replay" name="replay" :w="30" :h="30"></icon>
							</el-button>
							<el-button type="text" @click="showTrendAsy(scope.row)">
								<icon class="monitor" name="monitor" :w="30" :h="30"></icon>
							</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="table-div mg-t-20">
				<p class="table-header-class">参数极值统计</p>
				<el-table :data="l.coolSafeStatisticData" style="width: 100%">
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
								<span v-if="scope.row.lastMonthMinValue == 0 || !!scope.row.lastMonthMinValue">{{ fix(scope.row.lastMonthMinValue)}}</span>
								<span v-else>--</span>
							</template>
						</el-table-column>
					</el-table-column>
				</el-table>
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
import global from "@/utils/global";
import {
	pipeHeat
} from '../interface';
import {
	queryCoolSafe
} from '@/api/safeMonitor/index';
import {
	_groupBy,
	_sortBy,
	_filter
} from '@/utils/lodash';
export default defineComponent({
	setup() {
		const image = require('@/assets/images/safe/downpipe.jpg');
		const store = useStore();
		const state = store.state;
		const obj: pipeHeat = {
			list: {},
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
				"modules": ["DRAINHEAT"],
				"projectId": state.common.currentProject.projectId,
				"isAuthorityOn": false
			}).then((res: any) => {
				pageData.list = !!res.data.data.DRAINHEAT ? _sortBy(res.data.data.DRAINHEAT.map((e: any) => {
					return {
						...e,
						showAlarm: false,
						replayData: '',
						openStatus: false,
						coolSafeStatisticData: _filter(e.coolSafeStatisticData, (i: any) => {
							return i.propCode.indexOf('CONALARM') == -1
						})
					}
				}), 'roomName') : [];
			})
		};
		const isValue = (v: any) => {
			if (v === 0 || !!v) {
				return true
			} else {
				false
			}
		}
		const getStyle = (c: any) => {
			if (c.alarmFlag == true) {
				return {
					color: 'red'
				};
			} else if (c.realTimeValue === 1) {
				return {
					color: 'green'
				}
			} else {
				return {
					color: 'gray'
				};
			}
		};
		const returnToRealTime = (index: string) => {
			pageData.list[index]['showAlarm'] = false;
		};
		const replayAction = (index: string, row: any) => {
			pageData.list[index]['replayData'] = row;
			pageData.list[index]['showAlarm'] = true;
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
			getStyle,
			isValue,
			returnToRealTime,
			replayAction,
			image,
			fix,
			formatDate,
			showTrendAsy
		}
	}
})
</script>
