<template>
<div class="alarm-div">
	<h3>安全体检</h3>
	<div class="content-box clearfloat">
		<div class="box-l box-b">
			<div class="examine-div">
				<el-date-picker v-model="range" type="daterange" align="right" value-format="x" start-placeholder="开始日期" end-placeholder="结束日期">
				</el-date-picker>
				<p @click="getExamineList"><i class="el-icon-video-play"></i></p>
				<p @click="getExamineList">开始检测</p>
			</div>
		</div>
		<div class="box-r box-b">
			<p class="title">一共检查了 <span class="examine-no"> {{ getExamineLength() }}</span> 项，其中<span class="alarm-no"> {{getNo()}} </span>项有隐患</p>
			<div class="type-list">
				<div class="type-item" v-for="l in examineList" :key="l.type" @click="showAlarmDetailList(l)">
					<img :src="l.isPropCodeTiedIoPoint ?
	                require(`@/assets/images/safe/aircoolerExamine/${l.type}.png`) :
	                require(`@/assets/images/safe/aircoolerExamine/${l.type}_nobind.png`)" alt="">
					<p :class="{'alarm-tag': l.alarmDataList.length > 0}">{{ l.type }}</p>
				</div>
			</div>
		</div>
		<div v-if="!!alarmDetail" class="alarm-detail-list">
			<p>在所选时间段内 ({{ formatDate(Math.floor(range[0]),'YYYY-MM-DD') }}至{{ formatDate(Math.floor(range[1]),'YYYY-MM-DD') }}) <span class="alarm-tag">{{alarmDetail.type}}</span>产生 <span class="alarm-tag">{{alarmDetail.alarmDataList.length}} 次报警</span>
			</p>
			<div class="" v-if="alarmDetail.alarmDataList.length > 0">
				<el-row :gutter="20" justify="center">
					<el-col :span="4">&nbsp;</el-col>
					<el-col :span="10">报警名称</el-col>
					<el-col :span="6">发生时间</el-col>
					<el-col :span="2"> </el-col>
				</el-row>
				<el-row :gutter="20" v-for="(a,index) in alarmDetail.alarmDataList" :key="index" justify="center">
					<el-col :span="4">&nbsp;</el-col>
					<el-col :span="10">{{ a.alarmName }}</el-col>
					<el-col :span="6">{{ formatDate(a.beginTime)  }}</el-col>
					<el-col :span="2"> </el-col>
				</el-row>
			</div>
			<div class="real-box" v-if="realTimeList.length > 0">
				<div class="type-box">
					<div ref="scrollBox" id="scrollBox" class="real-content">
						<div v-for="r in filterReal()" :key="r.type" :id="r.type">
							<template v-if="r.type !== '库门电加热'">
								<h4>{{ r.type }}</h4>
								<div class="params-content" v-for="(d,k) in r.data" :key="k">
									<h5>{{ k }}</h5>
									<ul class="small-box">
										<li v-for="(c,index) in d" :key="k+index" @click="trendAnalysisFun(c.params)">
											<img :src="!c.params.alarmFlag ? require(`@/assets/images/safe/aircoolerReal/${r.type}.png`) : require(`@/assets/images/safe/aircoolerReal/${r.type}_alarm.png`)" alt="">
											<p>{{ c.objectSimpleName }}</p>
											<p>{{ c.params.name }}</p>
											<p v-if="c.params.propCode.indexOf('CONALARM') == -1">
												{{ fix(c.params.realTimeValue,1)}} {{ c.params.unit }}
											</p>
											<i v-else-if="c.params.realTimeValue !== null" class="el-icon-switch-button" :style="getStyle(c)"></i>
											<span v-else>--</span>
										</li>
									</ul>
								</div>
							</template>
							<template v-else>
								<h4>{{ r.type }}</h4>
								<div class="params-content" v-for="(d,k) in r.data" :key="k">
									<h5>{{ k }}</h5>
									<ul class="door-ul">
										<li class="door-li" v-for="(c,index) in d" :key="k+index">
											<p>{{ c.objectSimpleName }}</p>
											<div class="door-info">
												<img :src="getSrc(c, c.coolSafeRealTimeData)" alt="">
												<div>
													<div class="mg-b-10" :class="{'alarm' : m.alarmFlag == true}" v-if="m.propCode === 'DOORHEATERTT'" v-for="m in c.coolSafeRealTimeData">
														<p>{{ m.name}}</p>
														<p>{{fix(m.realTimeValue,1)}} {{ m.unit}}</p>
													</div>
												</div>
											</div>
											<div class="ground" :class="{'alarm' : m.alarmFlag == true}" v-if="m.propCode === 'GROUNDHEATERTT'" v-for="m in c.coolSafeRealTimeData">
												<p>{{ m.name}}</p>
												<p>{{fix(m.realTimeValue,1)}} {{ m.unit}}</p>
											</div>
										</li>
									</ul>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<el-dialog :title="choosed.instanceName" v-model="showTrend" width="60%">
	<Trend :pointCode="choosed.insPropcode" :pointName="choosed.instanceName" :metric="choosed.metric" :alarmConfig="choosed.alarmConfig"></Trend>
	<template #footer>
		<span class="dialog-footer">
			<el-button @click="showTrend = false">取 消</el-button>
			<el-button type="primary" @click="showTrend = false">确 定</el-button>
		</span>
	</template>
</el-dialog>
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
import {
	_compact,
	_groupBy,
	_flatten,
	_find,
	_filter
} from '@/utils/lodash';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const {
			formatDate,
			fix
		}: object = global();
		const obj = {
			range: [new Date().setHours(0, 0, 0, 0) - 86400000 * 7, new Date().setHours(0, 0, 0, 0)],
			examineList: [],
			currentItem: '',
			realTimeList: [],
			alarmDetail: {
				alarmDataList: []
			},
			choosed: {},
			showTrend: false
		};
		const pageData = reactive(obj);
		const getExamineList = () => {
			pageData.alarmDetail = {
				alarmDataList: []
			};
			queryCoolSafe({
				startTime: pageData.range[0],
				endTime: pageData.range[1],
				"modules": ["COMPOSITE"],
				childModuleCode: 1,
				"projectId": state.common.currentProject.projectId,
				'projectUuid': state.common.currentProject.projectUuid,
				"isAuthorityOn": false
			}).then(({
				data
			}: object) => {
				pageData.examineList = !!data.data.COMPOSITE ? data.data.COMPOSITE[0].securityChecksData.map((e: object) => {
					return {
						...e
					}
				}) : [];
				pageData.currentItem = pageData.examineList.length == 0 ? '' : pageData.examineList[0].type;
			})
		};
		const getrealTimeList = () => {
			queryCoolSafe({
				"modules": ["COMPOSITE"],
				childModuleCode: 2,
				"projectId": state.common.currentProject.projectId,
				'projectUuid': state.common.currentProject.projectUuid,
				"isAuthorityOn": false
			}).then(res => {
				var real = !!res.data.data.COMPOSITE ? res.data.data.COMPOSITE[0].securityChecksRealTimes : [];
				pageData.realTimeList = _compact(real.map((r: object) => {
					if (r.coolSafeRealTimeData.length > 0) {
						return {
							...r,
							data: _groupBy(_flatten(r.coolSafeRealTimeData.map((e: object) => {
								if (r.type !== '库门电加热') {
									return e.coolSafeRealTimeData.map((c: object) => {
										return {
											...e,
											params: c
										}
									})
								} else {
									return e
								}
							})), 'equipmentType')
						}
					}
				}))
			})
		};
		const showAlarmDetailList = (l: object) => {
			if (!l.isPropCodeTiedIoPoint) return
			pageData.currentItem = l.type;
			pageData.alarmDetail = l;
		};
		const getStyle = (c: object) => {
			if (c.params.alarmFlag == true) {
				return {
					color: 'red'
				};
			} else if (c.params.realTimeValue === 1) {
				return {
					color: 'green'
				}
			} else {
				return {
					color: 'gray'
				};
			}
		};
		// const scroll=(value:number) =>{
		// 	document.getElementById('scrollBox').scroll({
		// 		left: 0,
		// 		top: value,
		// 		behavior: 'smooth'
		// 	})
		// };
		// const onscroll=()=> {
		// 	const element = document.getElementById('scrollBox');
		// 	element.onscroll = () => {
		// 		this.realTimeList.forEach(e => {
		// 			const child = document.getElementById(e.type)
		// 			if (element.scrollTop > child.offsetTop - 50) this.activeType = e.type;
		// 		})
		// 	}
		// };
		const filterReal = () => {
			return _filter(pageData.realTimeList, ({
				type
			}: object) => type == pageData.currentItem);
		};
		const getExamineLength = () => {
			return pageData.examineList.filter(({
				isPropCodeTiedIoPoint
			}: object) => {
				return isPropCodeTiedIoPoint
			}).length
		};
		const getNo = () => {
			return pageData.examineList.filter(({
				alarmDataList
			}: object) => {
				return alarmDataList.length > 0
			}).length
		};
		const trendAnalysisFun = (item: object) => {
			console.log(item.insPropCode, 'code')
			pageData.choosed = {
				insPropcode: item.insPropCode,
				instanceName: item.name,
				metric: item.metric,
				alarmConfig: null
			}
			pageData.showTrend = true;
		};
		const getSrc = (i: object, Arr: Array < object > ) => {
			let imgStr: string = '';
			// 库门关
			let openStatus: Array < object > = !!_find(Arr, (e: object) => {
				return e.propCode == 'SWITCH' && !e.realTimeValue
			})
			// 处理后缀，电加热故障，地面加热故障还是全故障
			let strArr = [...new Set(_filter(Arr, (e: object) => {
				return e.alarmFlag && (e.propCode == 'DOORHEATERTT' || e.propCode == 'GROUNDHEATERTT')
			}).map((i: object) => {
				return i.propCode
			}))]

			if (!openStatus && i.doorType !== '快速卷帘门') { // 库门开处理
				imgStr = 'DASopen';
			} else if (!openStatus && i.doorType == '快速卷帘门') {
				imgStr = 'Kopen';
			} else if (openStatus && (i.doorType === '单开平移门' || i.doorType === '安全门')) { // 库门关
				imgStr = 'DAclose';
			} else if (openStatus && i.doorType === '快速卷帘门') {
				imgStr = `Kclose`
			} else if (openStatus && i.doorType === '双开平移门') {
				imgStr = `Sclose`
			} else {
				imgStr = 'DAclose'
			}
			if (strArr.length == 2) {
				imgStr = imgStr + 'All.png';
			} else if (strArr.length == 1) {
				imgStr = imgStr + strArr[0] + '.png';
			} else {
				imgStr = imgStr + 'Normal.png';
			}
			return require('@/assets/images/safe/' + imgStr);
		};

		onMounted(() => {
			getExamineList();
			getrealTimeList();
		});
		return {
			...toRefs(pageData),
			formatDate,
			getExamineList,
			getSrc,
			filterReal,
			fix,
			getExamineLength,
			getNo,
			showAlarmDetailList,
			trendAnalysisFun
		}
	}
})
</script>

<style media="screen" lang="scss" scoped>
@import '@/assets/scss/common.scss';
.alarm-div {
    @include padding_b(30px);
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
                    // text-align: center;
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
.real-box {
    display: flex;
    justify-content: space-between;
    height: 100%;
    background: $whiteColor;

    .type-box {
        flex: 1;
        height: 100%;
        overflow-y: hidden;

        .real-content {
            height: 100%;
            overflow-y: scroll;

            > div {
                h4 {
                    @include padding_l(10px);
                    @include padding_b(3px);
                    border-bottom: 1px solid #e8e8e8;
                }

                .params-content {
                    h5 {
                        @include padding_l(10px);
                        @include margin_t(10px);
                        font-size: 15px;
                    }

                    ul.small-box {
                        @include padding(10px);
                        display: flex;
                        flex-wrap: wrap;

                        li {
                            @include margin_b(20px);
                            width: 25%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            cursor: pointer;

                            img {
                                width: 50px;
                            }

                            i {
                                font-size: 20px;
                            }
                        }
                    }

                    ul.door-ul {
                        @include padding(10px);
                        display: flex;
                        flex-wrap: wrap;

                        li.door-li {
                            @include margin_b(20px);
                            width: 33%;
                            display: flex;
                            flex-direction: column;
                            align-items: left;
                            text-align: left;

                            .door-info {
                                color: #666;
                                display: flex;
                                align-items: center;
                                justify-content: center;

                                > div {
                                    margin-left: 10px;

                                    p {
                                        font-size: 14px;

                                        &.alarm {
                                            color: #CD180F;
                                        }
                                    }
                                }

                                img {
                                    width: 100px;
                                }
                            }

                            .ground {
                                p {
                                    font-size: 14px;
                                    color: #666;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .index-left {
        @include padding_l(10px);
        @include margin_l(10px);
        width: 140px;
        height: 100%;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;

        > div {
            cursor: pointer;
            color: #666;
            font-weight: 500;
            @include margin_t(20px);

            &.active {
                color: #2154c1;
            }
        }
    }
}
</style>
