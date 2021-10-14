<template>
<div class="weather-list">
	<el-carousel :interval="5000" indicator-position="none" arrow="never" :style="{height:height-30+'px'}" type="card">
		<el-carousel-item v-for="(w, index) in data" :key="index">
			<div class="city-info">
				<p class="city-name">{{ w.city }}</p>
				<p class="city-max">{{ w.maxTemperature }}℃</p>
				<p class="city-min">{{ w.minTemperature }}℃</p>
			</div>
		</el-carousel-item>
	</el-carousel>
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
export default defineComponent({
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
		return {
			...props
		}
	}
})
</script>
<style>
.weather-list {
	height: 100%;
}

.weather-list .el-carousel__container {
	height: 100%;
}

.weather-list .el-carousel__item {
	border-radius: 10px;
}

.weather-list .el-carousel__item h3 {
	color: #475669;
	font-size: 14px;
	opacity: 0.75;
	line-height: 200px;
	margin: 0;
}

.weather-list .el-carousel__item {
	/* background-color: rgba(153, 169, 191, 0.5); */
	background-image: radial-gradient(#071664, #00092b);
}

.weather-list .el-carousel__item .city-info {
	padding-top: 20px;
	display: flex;
	flex-direction: column;
	/* align-items: center; */
	justify-content: space-between;
}

.weather-list .el-carousel__item .city-name {
	font-size: 16px;
	text-align: center;
	color: #fff;
}

.weather-list .el-carousel__item .city-max {
	font-size: 16px;
	text-align: center;
	color: #f00;
}

.weather-list .el-carousel__item .city-min {
	font-size: 16px;
	text-align: center;
	color: #09e;
}

.weather-list .el-carousel__container .is-active {
	background-image: radial-gradient(#0d27ac, #081958);
}
</style>
