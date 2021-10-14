<template>
<div class="grid-component">
	<el-carousel :height="`${height*2-60}px`" indicator-position="outside" :interval="5000">
		<el-carousel-item v-for="(item,index) in list" :key="index">
			<ul class="clearfloat list">
				<li class="grid-item l" @click="showDetail(e)" v-for="(e,eindex) in item" :key="eindex" :style="{height:`${height-35}px`}">
					<span class="title mg-b-10" v-if="projectId">
						{{e.name}}
					</span>
					<span class="title mg-b-10" v-else>
						{{e.projectName}}
					</span>
					<span class="value">
						{{fix(e.value*100)}}%
					</span>
				</li>
			</ul>
		</el-carousel-item>
	</el-carousel>
	<el-dialog v-model="dialogVisible" :modal-append-to-body="false" width="50%" custom-class="line-dialog" :show-close="false">
		<p class="dialog-title">{{currentTitle}}</p>
		<el-row class="alarm-item" :gutter="20" element-loading-background="rgba(33, 98, 166, 0.9)" v-loading="loading">
			<el-col :span="8" class="grid-item-info">
				<div v-for="(a,index) in current.roomData" :class="{on:currentRoom==a.roomNum}" @click="showLine(a)" :key="index">
					<span>{{a.name}}</span>
					<span>{{fix(a.value*100)}}%</span>
				</div>
			</el-col>
			<el-col :span="16" style="min-height:300px">
				<LineChart :data="lineData" name="grid"></LineChart>
			</el-col>
		</el-row>
		<div class="button-list">
			<el-button type="primary" size="small" @click="handleClose">关 闭</el-button>
		</div>
	</el-dialog>

	<el-dialog v-model="lineDialog" :modal-append-to-body="false" element-loading-background="rgba(33, 98, 166, 0.9)" v-loading="loading" custom-class="line-dialog" width="50%" :show-close="false">
		<p class="dialog-title">{{currentTitle}}--昨日温度曲线</p>
		<LineChart :data="lineData" name="grid-tmp"></LineChart>
		<div class="button-list">
			<el-button type="primary" size="small" @click="lineDialog = false">关 闭</el-button>
		</div>
	</el-dialog>
</div>
</template>
<script lang='ts'>
import {
	getCurrentInstance,
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	computed
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_chunk
} from '@/utils/lodash';
import {
	ElMessage,
} from 'element-plus';
import {
	coolRoomTemperatureAnalysis
} from '@/api/intelligentMonitor/index';
import global from '@/utils/global';
import LineChart from './lineChart.vue';
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
		type: { //父的projectid
			type: Number,
			default: () => 0
		}
	},
	setup(props: any) {
		const {
			proxy
		}: any = getCurrentInstance();
		const {
			fix
		}: any = global();
		const store = useStore();
		const state = store.state;
		const pageData = reactive({
			currentTitle: '',
			current: {
				projectId: 0
			},
			currentRoom: '',
			dialogVisible: false,
			lineDialog: false,
			lineData: [],
			loading: true
		});
		const list = computed(() => _chunk(props.data, 6));
		const projectId = computed(() => props.type);
		const showDetail = (e: any) => {
			pageData.currentTitle = props.type ? e.name : e.projectName;
			pageData.current = e;
			pageData.currentRoom = props.type ? e.roomNum : e.roomData[0].roomNum;

			if (props.type) pageData.lineDialog = true;
			else {
				if (e.roomData.length == 0) return ElMessage.warning('暂无数据');
				pageData.dialogVisible = true;
			}
			coolRoomTemperatureAnalysisFun(pageData.currentRoom)
			store.commit('common/HANDLECAROUSEL', false);
		};
		const coolRoomTemperatureAnalysisFun = (roomNum: string) => {
			pageData.loading = true;
			coolRoomTemperatureAnalysis({
				projectCode: props.type ? props.type : pageData.current.projectId,
				deviceCode: roomNum,
				startDateTime: proxy.$root.$moment().startOf('day').valueOf() - 86400000,
				endDateTime: proxy.$root.$moment().startOf('day').valueOf()
			}).then((res: any) => {
				pageData.lineData = res.data.data.datas.map((e: any) => {
					return {
						...e,
						dateTime: e.date
					}
				});
				pageData.loading = false;
			}).catch(err => {
				pageData.loading = false
			})
		};
		const showLine = (n: any) => {
			pageData.currentRoom = n.roomNum;
			coolRoomTemperatureAnalysisFun(pageData.currentRoom)
		};
		const handleClose = () => {
			pageData.dialogVisible = false;
			store.commit('common/HANDLECAROUSEL', true);
		};
		return {
			...props,
			handleClose,
			showLine,
			...toRefs(pageData),
			list,
			fix,
			showDetail,
			projectId
		}
	}
})
</script>
<style media="screen" lang="scss" scoped>
@import '@/assets/scss/common.scss';
.grid-component {
    @include padding(10px);

    .grid-item {
        width: 31%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        background: #ccc;
        @include margin_r(3%);
        @include border_radius(20px);
        background: linear-gradient(to bottom,#071664, #09e);
        cursor: pointer;
        &:nth-child(1),
        &:nth-child(2),
        &:nth-child(3) {
            @include margin_b(10px);
        }
        &:nth-child(3n) {
            @include margin_r(0);
        }
        .title {
            font-size: 14px;
            font-weight: bold;
            height: 40px;
        }
        .value {
            font-size: 18px;
            font-weight: bold;
        }
    }
    .grid-item-info {
        & > div {
            @include padding_l(10px);
            @include padding_r(10px);
            height: 30px;
            line-height: 30px;
            @include margin_b(5px);
            border: 1px solid $primaryColor;
            @include border_radius(5px);
            color: $primaryColor;
            display: flex;
            justify-content: space-between;
            align-items: center;
            &.on {
                color: $whiteColor;
                border: none;
                background: linear-gradient(to bottom,#2c43b9, #09e);
            }
        }
    }
    .line-dialog {
        .el-dialog__header {
            padding: 0;
        }

        .el-dialog__body {
            background: linear-gradient(#0a2460,#61819d);
            .dialog-title {
                color: $whiteColor;
                font-size: 18px;
            }
            .button-list {
                text-align: center;
            }
        }
    }
}
</style>
