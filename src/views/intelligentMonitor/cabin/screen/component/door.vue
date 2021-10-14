<template>
<div class="door-component">
	<el-carousel :height="`${height*2-60}px`" indicator-position="outside" :interval="5000">
		<el-carousel-item v-for="(item,index) in list" :key="index">
			<ul class="clearfloat list">
				<li :class="{'door-item':type!='room','door-room-item':type=='room'}" class="l" @click="showDetail(e)" v-for="(e,eindex) in item" :key="eindex" :style="{height:`${height-35}px`}">
					<span class="title mg-b-10" v-if="!type">
						{{e.projectName}}
					</span>
					<span class="value" v-if="!type">
						{{e.alarmCount}}樘
					</span>
					<span v-if="type">
						<span class="icon" :class="{alarm:e.value>0,offline:e.value==-1}"></span>
						<span class="title">
							{{e.roomName}}
						</span>
					</span>
				</li>
			</ul>
		</el-carousel-item>
	</el-carousel>
	<el-dialog class="door-dialog" :modal-append-to-body="false" v-model="dialogVisible" width="50%" custom-class="d-class" :show-close="false">
		<p class="dialog-title">{{currentTitle}}</p>
		<el-row class="alarm-item" :gutter="20">
			<el-col :span="12" class="door-item-info" v-for="(a,index) in current.alarmInfo" :key="index">
				<div>
					<span>{{a.alarmName}}</span>
					<span>{{fix(a.value/60)}}min</span>
				</div>
			</el-col>
		</el-row>
		<div class="button-list">
			<el-button type="primary" size="small" @click="handleClose">关 闭</el-button>
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
	computed
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_chunk,
	_filter
} from '@/utils/lodash';
import {
	ElMessage,
} from 'element-plus';
import global from '@/utils/global';
export default defineComponent({
	props: {
		data: {
			type: Array,
			default: () => []
		},
		height: {
			type: Number,
			default: () => 0
		},
		type: {
			type: String,
			default: () => ''
		},
		room: {
			type: Array,
			default: () => []
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const {
			fix
		}: any = global();
		const pageData = reactive({
			currentTitle: '',
			current: {},
			currentRoom: '',
			dialogVisible: false,
			lineData: [],
			loading: true
		});
		const list = computed(() => _chunk(props.data, 6));
		const showDetail = (e: any) => {
			if (props.type) {
				if (e.value == 0) return ElMessage.warning('暂无异常');
				pageData.current = {
					alarmInfo: _filter(props.room, (o: any) => o.roomName == e.roomName)
				}
				pageData.currentTitle = e.roomName;
			} else {
				pageData.current = e;
				pageData.currentTitle = e.projectName;
			}
			pageData.dialogVisible = true;
			store.commit('common/HANDLECAROUSEL', false);
		};
		const handleClose = () => {
			pageData.dialogVisible = false;
			store.commit('common/HANDLECAROUSEL', true);
		};
		return {
			...toRefs(pageData),
			...props,
			showDetail,
			list,
			handleClose,
			fix
		}
	}
})
</script>
<style lang="scss">
@import '@/assets/scss/common.scss';
.door-component {
    @include padding(10px);
    .list {
        @include padding_t(10px);

    }
    .door-item {
        width: 31%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        background: #ccc;
        @include margin_r(3%);
        @include border_radius(20px);
        background: linear-gradient(to bottom,#071664, #09e);
        font-size: 20px;
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
            height: 35px;
            display: block;
        }
        .value {
            font-size: 18px;
        }
    }
    .door-room-item {
        width: 31%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
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
            height: 40px;
            display: block;
        }
        .value {
            font-size: 16px;
        }
        .icon {
            display: block;
            width: 30px;
            height: 30px;
            margin: 15px auto;
            background: url("../../../../../assets/images/fullScreen/door_blue.png") no-repeat center;
            background-size: cover;
            &.alarm {
                background: url("../../../../../assets/images/fullScreen/door_red.png") no-repeat center;
                background-size: cover;
            }
            &.offline {
                background: url("../../../../../assets/images/fullScreen/door_grey.png") no-repeat center;
                background-size: cover;
            }
        }
    }
    .door-item-info {
        & > div {
            @include padding_l(10px);
            @include padding_r(10px);
            height: 30px;
            line-height: 30px;
            @include margin_b(10px);
            border: 1px solid $primaryColor;
            @include border_radius(5px);
            color: $whiteColor;
            background: linear-gradient(to bottom,#2c43b9, #09e);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
    .d-class {
        .el-dialog__header {
            color: $primaryColor;
        }
    }
    .door-dialog {
        .el-dialog__header {
            padding: 0;
        }

        .el-dialog__body {
            background: linear-gradient(#0a2460,#61819d);
            .dialog-title {
                color: $whiteColor;
                font-size: 18px;
                text-align: center;
                @include margin_b(30px);
            }
            .button-list {
                text-align: center;
            }
        }
    }
}
</style>
