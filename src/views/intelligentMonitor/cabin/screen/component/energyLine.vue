<template>
<div :id="'chart'+keyValue" :style="{height:lineHeight+'px',width:width+'px'}"></div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	computed,
	getCurrentInstance,
	nextTick,
	watch,
	ref
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_sortBy
} from '@/utils/lodash';
export default defineComponent({
	props: {
		keyValue: {
			type: String,
			default: () => ''
		},
		options: {
			type: Object,
			default: () => {}
		},
		height: {
			type: Number,
			default: () => 0
		},
		data: {
			type: Array,
			default: () => []
		},
		property: {
			type: String,
			default: () => ''
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const lineHeight = computed(() => props.height);
		const list = computed(() => props.data);
		const width = ref(window.innerWidth * 0.29167 - 30);
		watch(list, (nv, ov) => {
			drawChartLine(nv, props.options)
		})
		const drawChartLine = (data: any, options: any) => {
			if (data.length == 0) return false
			const chartDom = proxy.$root.$echarts.init(document.getElementById("chart" + props.keyValue));
			chartDom.clear()
			chartDom.setOption({
				tooltip: {
					trigger: 'axis',
				},
				color: options.color,
				grid: {
					x: 50,
					x2: 20,
					y: 20,
					y2: 20
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					splitLine: {
						show: true,
						lineStyle: {
							type: 'solid',
							opacity: 0.4,
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
							color: options.color[2]
						}
					},
					axisLabel: {
						show: true,
						textStyle: {
							color: options.color[2],
							fontSize: '8px'
						}
					},
					data: _sortBy(data, 'timestamp').map((e: any) => proxy.$root.$moment(e.timestamp).format('MM/DD'))
				},
				yAxis: {
					type: 'value',
					splitLine: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: options.color[2]
						}
					},
					axisLabel: {
						show: true,
						textStyle: {
							color: options.color[2],
							fontSize: '8px'
						}
					}
				},
				series: [{
					type: 'line',
					smooth: false,
					label: {
						normal: {
							show: true,
							position: "top",
						}
					},
					color: options.color[2],
					areaStyle: {
						color: {
							type: "linear",
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [{
									offset: 0,
									color: options.color[0] // 0% 处的颜色
								},
								{
									offset: 1,
									color: options.color[1] // 100% 处的颜色
								}
							],
							global: false // 缺省为 false
						}
					},
					data: _sortBy(data, 'timestamp').map((e: any) => {
						return e[props.property] ? e[props.property].toFixed(2) : 0
					}),
				}]
			});
		};
		onMounted(() => {
			drawChartLine(list, props.options)
		})
		return {
			width,
			lineHeight,
			list
		}
	}
})
</script>
