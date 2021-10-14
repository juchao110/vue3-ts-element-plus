<template>
<div :id="key" :style="{height:calcHeight+'px'}" style="width:100%"></div>
</template>
<script lang='ts'>
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	ref,
	onMounted,
	nextTick,
	computed,
	watch
} from 'vue';
import {
	useStore
} from 'vuex';
export default defineComponent({
	props: {
		height: {
			type: Number,
			default: 300
		},
		options: {
			type: Object,
			required: true,
			default: {}
		}
	},
	setup(props: any, {
		expose
	}: any) {
		const store = useStore();
		const state = store.state;
		const {
			proxy
		}: any = getCurrentInstance();
		const key = ref(Math.random());
		watch(() => props.options, (nv, ov) => {
			resizeChart();
		});
		const calcHeight = computed(() => props.height);
		var chart: any;
		const handleChart = async () => {
			await nextTick();
			chart = proxy.$root.$echarts.init(document.getElementById(key.value.toString()));
			chart.clear();
			setTimeout(() => {
				chart.setOption(props.options);
			}, 100)
		};
		const resizeChart = async () => {
			await nextTick();
			chart.clear();
			setTimeout(() => {
				chart.setOption(props.options);
				chart.resize();
			}, 100)
		};
		onMounted(() => {
			handleChart();
		});
		expose({
			resizeChart
		});
		return {
			...props,
			key,
			calcHeight
		}
	}
})
</script>
