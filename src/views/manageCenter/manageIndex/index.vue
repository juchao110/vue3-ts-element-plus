<template>
<div class="manage-center-index">
	<div class="item">
		<h3>24小时冷库报警</h3>
		<ul class="clearfloat alarm-list">
			<li v-for="(i,index) in alarmList" :key="index" @click="queryDetail(index)">
				<i class="iconfont" :style="setStyle(index)" v-html="getIconFont(index)"></i>
				<p v-for="(v,vindex) in i" :key="vindex">{{v.countType===1?'':'未解除'}}{{v.countName}}:{{v.number}}{{v.countType===1?'座':'个'}}</p>
			</li>
		</ul>
	</div>
	<el-row class="yesterday-row" justify="space-between">
		<el-col :span="11">
			<div class="item">
				<h3>昨日温度达标率排名</h3>
				<el-table :data="temList" height="270">
					<el-table-column prop="index" label="排名" width="60" />
					<el-table-column prop="projectName" label="冷库名称" />
					<el-table-column prop="temRateValuePrecent" label="温度达标率" />
				</el-table>
			</div>
		</el-col>
		<el-col :span="12">
			<div class="item">
				<h3>昨日能耗排名</h3>
				<el-carousel indicator-position="outside" :interval="10000">
					<el-carousel-item v-for="(item,index) in energyChartList" :key="index">
						<Echart :ref="chart" :options="item.options" :height="250"></Echart>
					</el-carousel-item>
				</el-carousel>
			</div>
		</el-col>
	</el-row>
</div>
<el-dialog v-model="dialogVisible" title="报警列表" border width="50%">
	<el-table :data="alarmDetailList" style="width: 100%">
		<el-table-column prop="alarmName" label="报警名称" />
		<el-table-column prop="alarmTimeValue" label="报警时间" />
		<el-table-column prop="solveTimeValue" label="解决时间" />
	</el-table>
	<template #footer>
		<span class="dialog-footer">
			<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
		</span>
	</template>
</el-dialog>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	ref,
	onMounted,
	nextTick
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	query24ProjectsAlarm,
	query24ProjectsAlarmDetail,
	queryEnergyTemRateData
} from '@/api/manageCenter/index';
import {
	_sortBy,
	_groupBy,
	_chunk
} from '@/utils/lodash';
import global from '@/utils/global';
import {
	index
} from '../interface';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			formatDate,
			fix
		}: object = global();
		const obj: index = {
			alarmList: {},
			alarmDetailList: [],
			temList: [],
			energyChartList: [],
			dialogVisible: false
		};
		// const chart = ref < HTMLInputElement | null > (null);
		const pageData = reactive(obj);
		const query24ProjectsAlarmFun = () => {
			query24ProjectsAlarm({
				projectCodes: state.common.multipleProject
			}).then(({
				data
			}: object) => {
				pageData.alarmList = _groupBy(_sortBy(data.data, ['queryType', 'countType']), 'queryType');

			})
		};
		const queryDetail = (type: string) => {
			query24ProjectsAlarmDetail({
				queryType: type,
				projectCodes: state.common.multipleProject
			}).then(({
				data
			}: object) => {
				pageData.dialogVisible = true;
				pageData.alarmDetailList = data.data.map((e: object) => {
					e.alarmTimeValue = formatDate(e.alarmTime);
					e.solveTimeValue = formatDate(e.solveTime);
					return e;
				});
			})
		};
		const queryYesterday = async () => {
			await nextTick();
			queryEnergyTemRateData({
				projectIds: state.common.multipleProject
			}).then(({
				data
			}: object) => {
				pageData.temList = _sortBy(data.data, ({
					temRateValue
				}: object) => -temRateValue).map((e: object, index: number) => {
					return {
						index: index + 1,
						temRateValuePrecent: fix(e.temRateValue * 100, 1) + '%',
						...e
					}
				});
				pageData.energyChartList = _chunk(_sortBy(data.data, ({
					energyValue
				}: object) => -energyValue), 6).map((e: object) => {
					return {
						options: {
							color: ['#45d4ae'],
							tooltip: {
								trigger: 'axis',
								axisPointer: {
									type: 'shadow'
								}
							},
							grid: {
								left: '3%',
								right: '4%',
								bottom: '3%',
								containLabel: true
							},
							xAxis: {
								type: 'value',
								boundaryGap: [0, 0.01]
							},
							yAxis: {
								type: 'category',
								data: e.map(({
									projectName
								}: object) => projectName)
							},
							series: {
								name: '能耗',
								type: 'bar',
								barWidth: 10,
								data: e.map(({
									energyValue
								}: object) => energyValue)
							}
						}
					}
				})
			})
		};
		const chart = async (el: object) => {
			await nextTick();
			if (!el || Object.keys(el).length == 0) return false;
			el.resizeChart()
		}
		const getIconFont = (index: string) => {
			switch (index) {
				case '1':
					return '&#xe605;'
					break;
				case '2':
					return '&#xe605;'
					break;
				case '3':
					return '&#xe69d;'
					break;
				case '4':
					return '&#xe615;'
					break;
				case '5':
					return '&#xe613;'
					break;
				case '6':
					return '&#xe644;'
					break;
				case '7':
					return '&#xe6f1;'
					break;
				case '8':
					return ''
					break;
			}
		};
		const setStyle = (index: string) => {
			switch (index) {
				case '1':
					return {
						color: '#f32'
					}
					break;
				case '2':
					return {
						color: '#cec823'
					}
					break;
				case '3':
					return {
						color: '#f32'
					}
					break;
				case '4':
					return {
						color: '#f32'
					}
					break;
				case '5':
					return {
						color: '#333'
					}
					break;
				case '6':
					return {
						color: '#f8b62e'
					}
					break;
				case '7':
					return {
						color: 'red'
					}
					break;
				case '8':
					return ''
					break;
			}
		};
		onMounted(() => {
			query24ProjectsAlarmFun();
			queryYesterday();
		})
		return {
			...toRefs(pageData),
			getIconFont,
			setStyle,
			queryDetail,
			chart
		}
	}
})
</script>
<style media="screen" lang="scss">
@import '@/assets/scss/common.scss';
.manage-center-index {
    .item {
        h3 {
            @include padding_l(15px);
            border-left: 5px solid $primaryColor;
            margin: 15px 0;
            position: relative;
        }
        .alarm-list {
            width: 100%;
            @include padding(20px);
            li {
                display: block;
                float: left;
                width: 24%;
                cursor: pointer;
                @include margin_b(30px);
                @include margin_r(1%);
                @include padding(30px);
                @include box_shadow(0,0,5px,$borderColor);
                @include transition(box-shadow);
                @include border_radius(5px);
                text-align: center;
                &:hover {
                    @include box_shadow(0,0,5px,$primaryColor);
                }
                &:nth-child(4n) {
                    @include margin_r(0);
                }
                .iconfont {
                    font-size: 50px;
                }
                p {
                    font-size: 16px;
                    line-height: 40px;
                }
            }
        }

    }
    .yesterday-row {
        @include padding_l(20px);
        @include padding_r(20px);
        .el-col {
            @include box_shadow(0,0,5px,$borderColor);
            @include padding(20px);
        }
    }
}
</style>
