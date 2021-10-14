<template>
<div class="energy-component">
	<el-carousel :height="`${height*2-60}px`" indicator-position="outside" :interval="5000">
		<el-carousel-item v-for="(item,index) in list" :key="index">
			<div :id="`water-echart-${index}`" :style="{height:`${height*2-60}px`,width:width+'px'}"></div>
		</el-carousel-item>
	</el-carousel>
	<el-dialog v-model="dialogVisible" :modal-append-to-body="false" :show-close="false" :before-close="beforeClose" width="30%">
		<div class="dialog-title">
			<p>{{roomName}}--前七日{{name}}</p>

		</div>
		<LineChart :data="lineData" name="energy"></LineChart>
		<div class="button-list">
			<el-button type="primary" @click="close">关 闭</el-button>
		</div>
	</el-dialog>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	onMounted,
	computed,
	ref,
	watch,
	nextTick
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_sortBy,
	_filter,
	_flatten,
	_chunk
} from '@/utils/lodash';
import LineChart from './lineChart.vue';
interface data {
	dialogVisible: Boolean,
		lineOptions: object,
		lineHeight: number,
		randomKey: number,
		lineData: Array < any > ,
		roomName: string
}
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
		},
		name: {
			type: String,
			default: () => ''
		},
		keyValue: {
			type: String,
			default: () => ''
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const obj: data = {
			dialogVisible: false,
			lineOptions: {},
			lineHeight: 0,
			randomKey: 1,
			lineData: [],
			roomName: ''
		};
		const pageData = reactive(obj);
		const {
			proxy
		}: any = getCurrentInstance();
		const width = ref(window.innerWidth * 0.29167 - 30);
		const list = computed(() => _chunk(_sortBy(props.data, (o: any) => -o[props.keyValue]), 6));
		watch(list, (nv, ov) => {
			for (let i = 0; i < nv.length; i++) {
				doData(nv[i], i + '');
			}
		});
		const close = () => {
			pageData.dialogVisible = false;
			store.commit('common/HANDLECAROUSEL', true);
			pageData.lineData = []
		};
		const beforeClose = (done: any) => {
			pageData.lineData = []
			done()
		};
		const doData = (data: any, index: string) => {
			let options = {
				tooltip: {
					trigger: 'axis',
				},
				grid: {
					left: '6%',
					right: '4%',
					bottom: 0,
					containLabel: true
				},
				backgroundColor: new proxy.$root.$echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [{
					offset: 0,
					color: '#54565a' // 0% 处的颜色
				}, {
					offset: 1,
					color: '#00275d' // 100% 处的颜色
				}], false),
				xAxis: {
					type: 'value',
					boundaryGap: [0, 0.5],
					splitLine: {
						show: true,
						lineStyle: {
							type: 'solid',
							opacity: 0.2,
							color: {
								colorStops: [{
									offset: 0,
									color: '#ddd' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#eee' // 100% 处的颜色
								}],
							}
						}
					},
					axisLine: {
						lineStyle: {
							color: '#fff',
							fontWeight: 'bold'
						}
					},
					axisLabel: {
						show: true,
						width: 40,
						textStyle: {
							color: '#fff',
							fontSize: '8px',
							fontWeight: 'bold'
						},
					}
				},
				yAxis: {
					type: 'category',
					data: _sortBy(data, (o: any) => o[props.keyValue]).map((e: any) => e.projectName),
					name: props.name,
					splitLine: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: '#fff',
							fontWeight: 'bold'
						}
					},
					axisLabel: {
						show: true,
						width: 50,
						height: 40,
						textStyle: {
							color: '#fff',
							fontSize: '8px',
							fontWeight: 'bold'
						},
						formatter: (value: any, index: string) => {
							if (value.length <= 4) return value
							const first = value.substr(0, 3)
							return first + '\n' + value.substr(3, value.length)
						}
					}
				},
				series: [{
					name: props.name,
					data: _sortBy(data, (o: any) => o[props.keyValue]).map((e: any) => e[props.keyValue] ? e[props.keyValue].toFixed(2) : 0),
					type: 'bar',
					color: '#09e',
					label: {
						normal: {
							show: true,
							position: "right",
							textStyle: {
								color: '#fff',
								fontWeight: 'bold'
							}
						}
					},
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
				}]
			}
			drawLine(options, index)
		};
		const drawLine = async (options: any, index: string) => {
			await nextTick();
			var myChart = proxy.$root.$echarts.init(document.getElementById("water-echart-" + index));
			myChart.setOption(options);
			pageData.lineHeight = 300;
			pageData.lineOptions = {
				color: ['#09e', '#fff', '#fff']
			};
			pageData.randomKey = Math.random();
			myChart.on('click', (params: any) => {
				pageData.lineData = _filter(_flatten(list.value), (o: any) => {
					if (o.projectName) return o['projectName'] == params.name
				})[0].lastSevenDaysEnergy.map((item: any) => {
					return {
						...item,
						value: item.energyConsumption,
						dateTime: item.timestamp
					}
				});
				pageData.roomName = pageData.lineData.length > 0 ? pageData.lineData[0].projectName : '';
				pageData.dialogVisible = true;
				store.commit('common/HANDLECAROUSEL', false);
			})
		}
		return {
			...toRefs(pageData),
			list,
			close,
			beforeClose,
			width
		}
	}
})
</script>
<style lang="scss">
@import '@/assets/scss/common.scss';
.energy-component {
    .el-dialog__header {
        padding: 0;
    }

    .el-dialog__body {
        background: linear-gradient(#0a2460,#61819d);

        .dialog-title {
            color: $whiteColor;
            font-size: 18px;
            text-align: center;
        }

        .button-list {
            text-align: center;
        }
    }
}
</style>
