<template>
<div class="alarm-div">
	<h3>报警查询</h3>
	<div class="content-box top clearfloat">
		<div class="box-l box-t">
			<el-date-picker v-model="range" type="daterange" align="right" value-format="x" start-placeholder="开始日期" end-placeholder="结束日期">
			</el-date-picker>
			<el-button type="primary" @click="getAlarmList">查询</el-button>
			<ul class="list">
				<li @click="getLineData(i)" :class="{'alarm' : !i.endTime }" class="item" v-for="(i,index) in alarmList" :key="index">
					<p>{{ formatDate(i.beginTime)}}</p>
					<p>{{ i.alarmName }}</p>
				</li>
			</ul>
		</div>
		<div class="box-r box-t" v-if="alarmList.length!==0">
			<Trend :pointCode="choosed.insPropcode" :time="choosed.time" :pointName="choosed.instanceName" :metric="choosed.metric" :alarmConfig="choosed.alarmConfig"></Trend>
		</div>
	</div>
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
import {
	queryCoolSafe
} from '@/api/safeMonitor/index';
import global from '@/utils/global';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			formatDate
		}: object = global();
		const obj = {
			range: [new Date().setHours(0, 0, 0, 0) - 86400000 * 7, new Date().setHours(0, 0, 0, 0)],
			alarmList: [],
			choosed: {}
		};
		const pageData = reactive(obj);
		const getAlarmList = () => {
			queryCoolSafe({
				startTime: Math.floor(pageData.range[0]),
				endTime: Math.floor(pageData.range[1]),
				"modules": ["COMPOSITE"],
				childModuleCode: 0,
				"projectId": state.common.currentProject.projectId,
				'projectUuid': state.common.currentProject.projectUuid,
				"isAuthorityOn": false
			}).then(res => {
				pageData.alarmList = !!res.data.data.COMPOSITE ? res.data.data.COMPOSITE[0].alarmData : [];
				if (pageData.alarmList.length == 0) return false;
				pageData.choosed = {
					insPropcode: pageData.alarmList[0].pointCode,
					instanceName: pageData.alarmList[0].alarmName,
					metric: pageData.alarmList[0].metric,
					alarmConfig: JSON.parse(pageData.alarmList[0].alarmConfig),
					time: [pageData.alarmList[0].beginTime - 60 * 10 * 1000, pageData.alarmList[0].endTime ? pageData.alarmList[0].endTime : pageData.alarmList[0].beginTime + 40 * 60 * 1000]
				};
			})
		};
		const getLineData = (item: object) => {
			pageData.choosed = {
				insPropcode: item.pointCode,
				instanceName: item.alarmName,
				metric: item.metric,
				alarmConfig: JSON.parse(item.alarmConfig),
				time: [item.beginTime - 60 * 10 * 1000, item.endTime ? item.endTime : item.beginTime + 40 * 60 * 1000]
			};
		};
		onMounted(() => {
			getAlarmList();
		});
		return {
			...toRefs(pageData),
			formatDate,
			getAlarmList,
			getLineData
		}
	}
})
</script>

<style media="screen" lang="scss" scoped>
@import '@/assets/scss/common.scss';
.alarm-div {
    height: calc(100% - 10px);
    h3 {
        font-size: 16px;
        color: #fff;
        @include margin_t(10px);
        @include padding(8px);
        background: #2154c1;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    .content-box {
        border: 1px solid #e8e8e8;
        width: 100%;
        height: calc(100% - 60px);

        .box-l {
            @include padding(10px);
            float: left;
            height: 100%;
            overflow-y: hidden;

            &.box-t {
                width: 450px;
                border-right: 1px solid #e8e8e8;
            }

            &.box-b {
                width: 380px;
            }

            .list {
                @include padding_b(10px);
                height: calc(100% - 40px);
                overflow-y: scroll;

                .item {
                    cursor: pointer;
                    border: 1px solid #e8e8e8;
                    border-radius: 10px;
                    @include padding(10px);
                    @include margin_t(10px);

                    &.alarm {
                        border: 1px solid $redColor;
                    }
                }
            }

            .examine-div {
                text-align: center;

                p {
                    font-size: 18px;
                    cursor: pointer;

                    i {
                        @include margin_t(20px);
                        cursor: pointer;
                        font-size: 100px;
                        color: #666;
                    }
                }
            }
        }

        .box-r {
            float: left;
            height: 100%;
            overflow-y: hidden;
            @include padding(10px);

            .alarm-trend {
                @include margin_t(10px);
                width: 100%;
                height: calc(100% - 200px);
            }

            .title {
                text-align: center;
                @include padding(10px);
                font-size: 18px;

                .alarm-no {
                    color: #CD180F;
                    font-weight: 500;
                }

                .examine-no {
                    color: blue;
                    font-weight: 500;
                }
            }

            &.box-t {
                width: calc(100% - 450px);
            }

            &.box-b {
                width: calc(100% - 380px);
            }

            .type-list {
                width: 100%;
                display: flex;
                flex-wrap: wrap;

                .type-item {
                    cursor: pointer;
                    text-align: center;
                    width: 120px;

                    .alarm-tag {
                        color: #CD180F;
                    }

                    img {
                        width: 60px;
                        height: 60px;
                    }
                }
            }
        }

        .alarm-detail-list {
            @include padding(20px);
            clear: both;
            border-top: 1px solid #e8e8e8;

            .el-row {
                margin-left: 0;
                margin-right: 0;
                width: 100%;
                @include padding(5px);

                &:nth-child(1) {
                    text-align: center;
                }

                &:nth-child(even) {
                    background: #F5F7FA;
                }
            }

            p {
                @include padding(10px);
                font-weight: 500;
                text-align: center;

                .alarm-tag {
                    color: #CD180F;
                }
            }
        }
    }
}
</style>
