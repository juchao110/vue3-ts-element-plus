<template>
<ul class="alarm-label clearfloat">
	<li class="l " v-for="(d, index) in list" :key="index" :class="{
              'need-red': d.description == '能耗异常' || d.description == '应急报警'
            }" @click="showMore(d)">
		<p>{{ d.description }}</p>
		<div class="label-bg" :style="circleStyle">{{ d.count }}</div>
	</li>
	<el-dialog v-model="dialogVisible" :modal-append-to-body="false" width="50%" custom-class="d-class" :show-close="false">
		<div class="dialog-title">
			{{currentTitle}}
		</div>
		<el-select v-model="current" class="mg-b-20" size="small" @change="handleChange" placeholder="请选择">
			<el-option v-for="item in projectList" :key="item" :label="item" :value="item">
			</el-option>
		</el-select>
		<el-row class="alarm-item" type="flex" justify="space-between" v-for="(a,index) in alarmList" :key="index">
			<el-col :span="12">{{a.alarmName}}</el-col>
			<el-col :span="12" style="text-align:right;">{{formatDate(a.beginTime,'YYYY-MM-DD HH:mm')}}</el-col>
		</el-row>
		<div class="button-list">
			<el-button type="primary" size="small" @click="handleClose">关 闭</el-button>
		</div>
	</el-dialog>
</ul>
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
	_sortBy,
	_cloneDeep,
	_groupBy,
	_filter
} from '@/utils/lodash';
import global from '@/utils/global';
interface alarm {
	dialogVisible: Boolean,
		alarmList: Array < any > ,
		alarmListCopy: Array < any > ,
		projectList: Array < any > ,
		current: any,
		currentTitle: string,
}
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
		const {
			formatDate
		}: any = global();
		const store = useStore();
		const state = store.state;
		const obj: alarm = {
			dialogVisible: false,
			alarmList: [],
			alarmListCopy: [],
			projectList: [],
			current: {},
			currentTitle: '',
		}
		const list = computed(() => props.data);
		const circleStyle = computed(() => {
			return {
				height: `${props.height - 70}px`,
				width: `${props.height - 70}px`,
				lineHeight: `${props.height - 80}px`
			}
		})
		const pageData = reactive(obj);
		const showMore = (d: any) => {
			pageData.dialogVisible = true;
			pageData.currentTitle = d.description;
			pageData.alarmList = _sortBy(d.alarmData, 'beginTime');
			pageData.alarmListCopy = _cloneDeep(_sortBy(d.alarmData, 'beginTime'));
			const group = _groupBy(_sortBy(d.alarmData, 'beginTime'), 'projectName');
			pageData.projectList = Object.keys(group);
			pageData.current = pageData.projectList[0];
			handleChange(pageData.current);
			store.commit('common/HANDLECAROUSEL', false);
		};
		const handleChange = (data: string) => {
			pageData.alarmList = _filter(pageData.alarmListCopy, (o: any) => o.projectName == data)
		};
		const handleClose = () => {
			pageData.dialogVisible = false;
			store.commit('common/HANDLECAROUSEL', true);

		}
		return {
			...toRefs(pageData),
			...props,
			showMore,
			list,
			circleStyle,
			formatDate,
			handleClose
		}
	}
})
</script>
<style lang="scss">
@import '@/assets/scss/common.scss';
.alarm-label {
    height: calc(100% - 25px);
    @include padding_t(10px);
    display: flex;
    justify-content: center;
    & > li {
        display: block;
        width: 25%;
        height: 100%;
        @include padding_l(5px);
        @include padding_r(5px);
        &.need-red {
            .label-bg {
                border: 3px solid $redColor;
                color: $redColor;
            }
        }
        p {
            @include margin_b(10px);
            text-align: center;
            font-size: 14px;
        }
        .label-bg {
            @include border_radius(50%);
            border: 3px solid $yellowColor;
            color: $yellowColor;
            text-align: center;
            font-size: 20px;
            margin: 0 auto;
            cursor: pointer;
        }
    }
    .d-class {
        // background-image: radial-gradient(#4395ff, #fff);
    }
    .alarm-item {
        @include padding_l(10px);
        @include padding_r(10px);
        height: 30px;
        line-height: 30px;
        @include margin_b(15px);
        background: linear-gradient(to bottom,#2c43b9, #09e);
        @include border_radius(5px);
        color: $whiteColor;

    }
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
</style>
