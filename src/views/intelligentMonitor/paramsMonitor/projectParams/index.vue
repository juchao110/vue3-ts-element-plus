<template lang="html">
  <div class="project-params-page">
    <div class="search-action">
		<el-input v-model="searchKey" placeholder="请输入测点名称" class="width-200" @change="searchAction"  clearable></el-input>
		<el-button type="primary" @click="searchAction">搜索</el-button>
	</div>
  <el-row class="params-list-row" :gutter="20">
		<el-col :span="20" id="list">
			<div class="params-list">
				<div class="tag-level" v-for="(tag,tagindex) in tagList" :key="tagindex" :id="tag.tagName">
					<h4>{{tag.tagName}}</h4>
					<div class="monitor-level" v-for="(monitor,monitorindex) in tag.children" :key="monitorindex">
						<h5 :id="monitor.monitorGroupName">{{monitor.monitorGroupName}}</h5>
						<div class="type-level" v-for="(type,typeindex) in monitor.children" :key="typeindex">
							<h6>{{type.typeName}}</h6>
							<ul class="clearfloat">
								<li class="l" v-for="(i,dindex) in type.children" :key="dindex" :class="{ 'is-alarm': getAlarmStatus(i) }" @click="popChart(i)">
									<strong>{{ getValue(i.value) }}{{ i.pointUnit }}</strong>
									<p>{{ i.pointName }}</p>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</el-col>
		<el-col :span="4" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
			<div class="tree-list">
				<el-collapse v-model="activeNames" @change="handleChange" :accordion="true">
					<el-collapse-item :title="tag.tagName" :class="{'is-alarm':tag.isAlarm}" :name="tag.tagName" v-for="(tag,tagindex) in tagList" :key="tagindex">
						<div class="second-level" @click="handleClick(monitor.monitorGroupName)" v-for="(monitor,monitorindex) in tag.children" :key="monitorindex">
							<h5>{{monitor.monitorGroupName}}</h5>
						</div>
					</el-collapse-item>
				</el-collapse>
			</div>
		</el-col>
	</el-row>
  <el-dialog
  title="测点趋势"
  v-model="showTrend"
  width="60%"
  >
  <Trend :pointCode="choosed.pointCode" :pointName="choosed.pointName" :metric="choosed.metric" :alarmConfig="choosed.alarmConfig"></Trend>
  <template #footer>
    <span class="dialog-footer">
      <el-button @click="showTrend = false">取 消</el-button>
      <el-button type="primary" @click="showTrend = false">确 定</el-button>
    </span>
  </template>
</el-dialog>
  </div>
</template>

<script lang="ts">
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	nextTick
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	projectParams
} from '../interface';
import {
	_groupBy,
	_compact,
	_sortBy,
	_cloneDeep,
	_filter
} from '@/utils/lodash';
import {
	queryMonitorGroupDatas
} from '@/api/paramsMonitor/index';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const obj: projectParams = {
			searchKey: '',
			tagList: [],
			activeNames: '',
			responseList: [],
			showTrend: false,
			choosed: {}
		};
		const pageData = reactive(obj);
		const searchAction = () => {
			doData(_filter(pageData.responseList, (o: any) => o.pointName.indexOf(pageData.searchKey) > -1));
		};
		const doData = (res: any) => {
			const group = _groupBy(_sortBy(res, ['tagCode', 'pointName']), 'tagName');
			pageData.tagList = Object.keys(group).map((k: any) => {
				const monitorGroup = _groupBy(group[k], 'monitorGroupId');
				return {
					tagName: k,
					isAlarm: _compact(group[k].map((s: any) => getAlarmStatus(s))).length > 0 ? true : false,
					children: Object.keys(monitorGroup).map((gk: any) => {
						const typeGroup = _groupBy(monitorGroup[gk], 'typeName');
						if (monitorGroup[gk].length == 0) return [];
						const {
							monitorGroupName,
							monitorGroupId
						} = monitorGroup[gk][0];
						return {
							monitorGroupName,
							monitorGroupId,
							children: Object.keys(typeGroup).map((tk: any) => {
								if (typeGroup[tk].length == 0) return [];
								const {
									typeName
								} = typeGroup[tk][0];
								return {
									typeName,
									children: typeGroup[tk]
								}
							})
						}

					})
				}
			})
			onscroll();
			return false;
		};
		const queryGroupsMetricDataFun = () => {
			return queryMonitorGroupDatas({
				projectUuid: state.common.currentProject.projectUuid,
				projectId: state.common.currentProject.projectId
			}).then((res: any) => {
				pageData.responseList = res.data.data.map((e: any) => {
					if (!e.tagName) {
						e.tagName = _cloneDeep(e.typeName);
						e.typeName = _cloneDeep(e.equipmentName);
						e.isSystem = true;
					}
					return e;
				});
				doData(pageData.searchKey ? _filter(pageData.responseList, (o: any) => o.pointName.indexOf(pageData.searchKey) > -1) : pageData.responseList);
			});
		};
		const popChart = (item: object) => {
			pageData.choosed = item;
			pageData.showTrend = true;
		};
		const scroll = async (value: number) => {
			await nextTick();
			const ele: any = document.getElementById('list');
			ele.scroll({
				left: 0,
				top: value,
				behavior: 'smooth'
			})
		};
		const onscroll = () => {
			const element: any = document.getElementById('list');
			element.onscroll = () => {
				pageData.tagList.forEach(e => {
					const child: any = document.getElementById(e.tagName)
					if (element.scrollTop > child.offsetTop - 50) pageData.activeNames = e.tagName;
				})
			}
		};
		const handleChange = async (data: string) => {
			await nextTick();
			scroll(document.getElementById(data).offsetTop)
		};
		const getAlarmStatus = (i: any) => {
			if (i.metric === "ALARM" && i.value == 1) return true;
			else return false;
		};
		const handleClick = (name: string) => {
			const ele: any = document.getElementById(name);
			scroll(ele.offsetTop)
		};
		const getValue = (value: any) => {
			if (parseInt(value) == value) return value;
			else return value ? parseFloat(value).toFixed(2) : "";
		};
		onMounted(() => {
			queryGroupsMetricDataFun();
		})
		return {
			...toRefs(pageData),
			searchAction,
			getValue,
			handleClick,
			getAlarmStatus,
			popChart,
			handleChange
		}
	}
})
</script>

<style lang="css" scoped>
</style>
