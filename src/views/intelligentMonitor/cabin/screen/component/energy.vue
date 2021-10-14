<template>
<div class="energy-component">
	<el-carousel :height="`${height*2-60}px`" indicator-position="outside" :interval="5000">
		<el-carousel-item v-for="(item,index) in list" :key="index">
			<div :id="`echart-${index}`" :style="{height:`${height*2-60}px`}"></div>
		</el-carousel-item>
	</el-carousel>
	<el-dialog :show-close="false" :modal-append-to-body="false" v-model="dialogVisible" :before-close="beforeClose" width="30%">
		<div class="dialog-title">
			{{roomName}}--前七日电耗
		</div>
		<LineChart :options="lineOptions" :data="lineData" property="energyConsumption" :height="lineHeight"></LineChart>
		<div class="button-list">
			<el-button type="primary" @click="close">关 闭</el-button>
		</div>
	</el-dialog>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	computed,
	watch,
	getCurrentInstance
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_chunk,
	_sortBy,
	_filter,
	_flatten
} from '@/utils/lodash';
import LineChart from './energyLine.vue';
export default defineComponent({
	components: {
		LineChart
	},
	props: {
		data: {
			type: Array,
			default: () => []
		},
		height: {
			type: Number,
			default: () => 0
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const pageData = reactive({
			dialogVisible: false,
			lineOptions: {},
			lineHeight: 0,
			randomKey: 1,
			lineData: [],
			roomName: ''
		});
		const list = computed(() => _chunk(_sortBy(props.data, (o: any) => -o.energyConsumption), 6))
		watch(list, (nv, ov) => {
			for (let i = 0; i < nv.length; i++) {
				doData(nv[i], i);
			}
		});
		const doData = (data: Array < any > , index: number) => {
			let options = {
				legend: {
					data: [{
						name: '电耗',
						textStyle: {
							color: '#fff'
						}
					}, {
						name: '单位容积电耗',
						textStyle: {
							color: '#fff'
						}
					}]
				},
				tooltip: {
					trigger: 'axis',
				},
				xAxis: {
					type: 'category',
					data: data.map((e: any) => e.projectName),
					boundaryGap: [0, 0.2],
					axisLine: {
						lineStyle: {
							color: '#fff'
						}
					},
					axisLabel: {
						show: true,
						width: 25,
						textStyle: {
							color: '#fff',
							fontSize: '8px'
						},
						formatter: (value: any, index: string) => {
							if (value.length <= 3) return value
							const first = value.substr(0, 3)
							if (value.length <= 6) return first + '\n' + value.substr(3, value.length)
							const second = value.substr(3, 6)
							return first + '\n' + second + '\n' + value.substr(6, value.length)
						}
					}
				},
				yAxis: [{
						type: 'value',
						name: '电耗(kWh)',
						splitLine: {
							show: false
						},
						axisLine: {
							lineStyle: {
								color: '#fff'
							}
						},
						axisLabel: {
							show: true,
							textStyle: {
								color: '#fff',
								fontSize: '8px'
							},

						}
					},
					{
						type: 'value',
						name: '单位容积\n电耗(kWh/m³)',
						splitLine: {
							show: false
						},
						axisLine: {
							lineStyle: {
								color: '#fff'
							}
						},
						axisLabel: {
							show: true,
							textStyle: {
								color: '#fff',
								fontSize: '8px'
							},

						}
					}
				],
				series: [{
					name: '电耗',
					data: data.map((e: any) => e.energyConsumption.toFixed(2)),
					type: 'bar',
					barWidth: 10,
					itemStyle: {
						normal: {
							color: (params: any) => {
								var colorList = [
									['#FFBC1B', '#FF6804'],
									['#67FDC6', '#00F5F5'],
									['#52F890', '#26A864'],
									['#5DA2FF', '#004CC9'],
									['#9882F9', '#5533E9']
								];

								var index = params.dataIndex % colorList.length;
								// 如果是纵向的图标，则改为0, 0 , 0, 1
								return new proxy.$root.$echarts.graphic.LinearGradient(1, 0, 0, 0, [{
										offset: 0,
										color: colorList[index][0]
									},
									{
										offset: 1,
										color: colorList[index][1]
									}
								]);
							},
							barBorderRadius: 5 //柱状角成椭圆形
						}
					}
				}, {
					name: '单位容积电耗',
					data: data.map((e: any) => e.energyCubicMetre.toFixed(2)),
					type: 'line',
					yAxisIndex: 1,
					color: '#0ff'

				}]
			}
			drawLine(options, index)
		};
		const drawLine = (options: object, index: number) => {
			var myChart = proxy.$root.$echarts.init(document.getElementById("echart-" + index));
			myChart.setOption(options);
			pageData.lineHeight = 300;
			pageData.lineOptions = {
				color: ['#0b6', '#333', '#fff']
			};
			pageData.randomKey = Math.random();
			myChart.on('click', (params: any) => {
				pageData.lineData = _filter(_flatten(list), (o: any) => o.projectName == params.name)[0].lastSevenDaysEnergy;
				pageData.roomName = pageData.lineData.length > 0 ? pageData.lineData[0]['projectName'] : '';
				pageData.dialogVisible = true;
				store.commit('common/HANDLECAROUSEL', false);
			})
		};
		const close = () => {
			pageData.dialogVisible = false;
			store.commit('common/HANDLECAROUSEL', true);
			pageData.lineData = []
		}
		return {
			...props,
			list
		}
	}
})
</script>
