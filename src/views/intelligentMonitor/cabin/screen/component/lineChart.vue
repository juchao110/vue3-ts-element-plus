<template>
<div :id="`line${name}`" style="height:300px"></div>
</template>
<script lang='ts'>
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	onMounted,
	nextTick,
	computed,
	watch
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_max,
	_sortBy,
	_groupBy,
	_min
} from '@/utils/lodash';
export default defineComponent({
	props: {
		data: {
			type: Array,
			default: () => []
		},
		name: {
			type: Number || String,
			default: Math.random()
		}
	},
	setup(props: any) {
		const {
			proxy
		}: any = getCurrentInstance();
		const store = useStore();
		const state = store.state;
		const list = computed(() => props.data);
		watch(list, (nv, ov) => {
			handleChart(nv)
		});
		const handleChart = async (response: Array < any > ) => {
			await nextTick();
			const chart = proxy.$root.$echarts.init(document.getElementById('line' + props.name));
			chart.clear()
			chart.setOption({
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross'
					},
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					axisLabel: {
						show: true,
						textStyle: {
							color: '#fafafa',
							fontSize: '8px'
						}
					}
				},
				yAxis: [{
					name: null,
					type: "value",
					axisLine: {
						show: true,
						lineStyle: {
							color: '#fafafa'
						}
					},
					max: _max([...response.map((e: any) => Math.round(e.value) + 1)]),
					min: _min([...response.map((e: any) => Math.round(e.value) - 1)]),
					boundaryGap: ['5%', '5%'],
					axisLabel: {
						show: true,
						textStyle: {
							color: '#fafafa',
							fontSize: '8px'
						}
					}
				}],
				series: {
					type: 'line',
					showSymbol: false,
					symbol: "none",
					smoothMonotone: "x",
					lineStyle: {
						shadowColor: "#09e",
						shadowOffsetX: 0,
						shadowOffsetY: 0,
						opacity: 1,
						shadowBlur: 8,
						type: "solid",
						width: 2
					},
					data: _sortBy(response, 'dateTime').map((time: any) => [proxy.$root.$moment(time.dateTime).format('YYYY-MM-DD HH:mm:ss'), Number(time.value.toFixed(2))])
				}
			})
		};
		onMounted(() => {
			handleChart(list.value)
		})
		return {
			...props
		}
	}
})
</script>
