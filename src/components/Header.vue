<template>
<div class="header-component">
	<el-row>
		<el-col :span="12" class="left-part">
			<img src="../assets/images/header/logo_white.png" class="logo-img" alt="">
			<p>质·慧冷库健康管理PHM</p>
			<i class="el-icon-s-home" @click="goHome"></i>
			<span class="title">{{titleName}}</span>
		</el-col>
		<el-col :span="12" class="right-part">
			<div class="project-action mg-r-40">
				<div class="" v-if="isMany==0">
					<el-select style="width: 220px" class="storageSelect" filterable v-model="currentIndex" @change="handleChange">
						<el-option v-for="(item, index) in projectList" :key="item.projectUuid" :label="item.projectName" :value="item.projectUuid">
						</el-option>
					</el-select>
				</div>
				<div class="handle-more-project" v-else>
					<el-popover placement="bottom" v-model:visible="popover" :width="900" :visible-arrow="false" trigger="click" @hide="popoverHide">
						<template #reference>
							<span class="show-all">查看冷库项目
								<i class="iconfont">&#xe642;</i>
							</span>

						</template>
						<el-checkbox-group v-model="projectIds" :min="1" @change="handleCheckChange" class="project-multiple-checkbox">
							<el-checkbox :label="p.projectId" v-for="(p,index) in projectList" :key="index" border>{{p.projectName}}</el-checkbox>
						</el-checkbox-group>
						<div class="project-multiple-button" style="text-align:center;margin: 20px 0">
							<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" border>全选</el-checkbox>
							<el-button class="search-btn" type="primary" @click="search">查询</el-button>
						</div>
					</el-popover>
				</div>
			</div>
			<div class="company-name">
				{{userInfo.companyName}}
			</div>
			<div class="info">
				<div class="user-icon">
					<img :src="userInfo.icon" alt="" />
					<input type="file" @change="changeIcon" class="upload-icon" />
				</div>
				<el-dropdown @command="commandAction">
					<span class="el-dropdown-link">
						<span>{{ userInfo.name }}</span>
						<i class="el-icon-caret-bottom el-icon--right"></i>
					</span>
					<template #dropdown>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item command="loginout">退出登录</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</el-col>
	</el-row>
</div>
</template>

<script lang="ts">
import {
	ref,
	toRefs,
	reactive,
	computed,
	watch,
	effect,
	getCurrentInstance,
	defineComponent
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	useRoute,
	useRouter,
	onBeforeRouteUpdate
} from 'vue-router';
import useGlobalFunction from '@/utils/useGlobalFunction';
import Cookies from 'js-cookie';
import {
	_isEqual,
	_sortBy,
	_cloneDeep
} from '@/utils/lodash';
export default defineComponent({
	setup(props: any, {
		emit
	}: object) {
		const store = useStore();
		const state = store.state;
		const route = useRoute();
		const router = useRouter();
		const {
			getLocal
		} = useGlobalFunction();
		const titleName = getLocal('moduleTitle', 'session');
		const breadList = computed(() => store.getters['bread/getNavList']);
		const projectList = computed(() => state.common.projectList);
		const isMany = computed(() => state.common.isMany);
		onBeforeRouteUpdate((to, from) => {
			sessionStorage.setItem('phmNavList', JSON.stringify(ref(breadList).value.map(e => {
				return {
					name: e.name,
					meta: e.meta
				}
			})))
			store.commit('common/SETCURRENTPATH', to.fullPath);
		})
		const data = reactive({
			userInfo: getLocal('phm_userInfo'),
			currentIndex: JSON.stringify(state.common.currentProject) == '{}' ? projectList.value[0].projectUuid : state.common.currentProject.projectUuid,
			popover: false,
			isIndeterminate: false,
			checkAll: false,
			projectIdsCopy: projectList.value.map(({
				projectId
			}: object) => projectId).splice(0, 2),
			projectIds: projectList.value.map(({
				projectId
			}: object) => projectId).splice(0, 2),
		})
		store.commit('common/SETMULTIPLE', data.projectIds);
		const handleChange = (data: string) => {
			emit('uuid', data);
			store.dispatch('common/setCurrentProject', projectList.value.filter(e => e.projectUuid == data)[0])
		};
		const commandAction = (name: string) => {
			if (name == 'loginout') {
				store.dispatch('bread/clearNavListAction');
				store.dispatch('common/setMany', 0);
				localStorage.clear();
				sessionStorage.removeItem("currentProject");
				sessionStorage.removeItem("phmNavList");
				Cookies.remove('Admin-Token');
				router.push({
					path: "/login/loginin"
				});
			}
		};
		const changeIcon = () => {

		};
		const goHome = () => {
			router.replace({
				name: 'home'
			})
		};
		const handleCheckChange = (value: Array < string | number > ) => {
			if (value.length == projectList.value.length) data.checkAll = true;
			data.isIndeterminate = value.length > 0 && value.length < projectList.value.length;
		};
		const handleCheckAllChange = (val: boolean) => {
			data.projectIds = val ? projectList.value.map(({
				projectId
			}: object) => projectId) : [projectList.value[0].projectId];
			data.isIndeterminate = false;
		};
		const popoverHide = () => {
			if (_isEqual(_sortBy(data.projectIds), _sortBy(data.projectIdsCopy))) return false;
			data.projectIdsCopy = _cloneDeep(data.projectIds);
			store.commit('common/SETMULTIPLE', data.projectIds);
			emit('uuids', data.projectIds);
		};
		const search = () => {
			data.popover = false;
		}
		return {
			...toRefs(data),
			commandAction,
			changeIcon,
			breadList,
			projectList,
			handleChange,
			goHome,
			titleName,
			isMany,
			popoverHide,
			handleCheckChange,
			handleCheckAllChange,
			search
		}
	}
})
</script>

<style lang="scss">
@import '@/assets/scss/common.scss';
.header-component {
    height: 50px;
    background: #3b414d;
    @include padding_l(20px);
    @include padding_r(20px);
    .el-row {
        height: 100%;
        .left-part {
            display: flex;
            height: 100%;
            justify-content: flex-start;
            flex-direction: row;
            align-items: center;
            .logo-img {
                height: 40px;
            }
            p {
                font-size: 16px;
                font-weight: bold;
                color: $whiteColor;
                @include margin_l(20px);
                @include margin_r(20px);
            }
            .el-icon-s-home {
                font-size: 20px;
                color: $whiteColor;
                @include margin_r(10px);
                cursor: pointer;
            }
            .title {
                font-size: 16px;
                color: $whiteColor;
                border-left: 1px solid $whiteColor;
                @include padding_l(10px);
            }

        }
        .right-part {
            display: flex;
            height: 100%;
            justify-content: flex-end;
            align-items: center;
            .el-input__inner {
                color: $whiteColor;
            }
            .storageSelect {
                input {
                    background: #545a65;
                    border: none;
                    @include border_radius(20px);
                    height: 30px;
                    font-size: 12px;
                }
                .el-input__suffix {
                    top: -5px;
                }
            }
            .company-name {
                color: $whiteColor;
                font-size: 16px;
                font-weight: 600;
                border-right: 1px solid $borderColor;
                @include margin_r(20px);
                @include padding_r(20px);
            }
            .info {
                position: relative;
                border-radius: 20px;
                height: 30px;
                display: flex;
                align-items: center;
                .user-icon {
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    img {
                        height: 100%;
                        width: 100%;
                        @include border_radius(50%);
                    }
                    .upload-icon {
                        display: block;
                        width: 100%;
                        height: 100%;
                        opacity: 0;
                        position: absolute;
                        left: 0;
                        top: 0;
                        cursor: pointer;
                    }
                }
                .el-dropdown-link {
                    span {
                        color: $whiteColor;
                        font-size: 12px;
                        display: inline-block;
                        @include padding_l(10px);
                    }
                    .el-icon-caret-bottom {
                        color: $whiteColor;
                    }
                }
            }
            .handle-more-project {
                cursor: pointer;

                .show-all {
                    background: #545a65;
                    @include padding_a(5px,40px,5px,40px);
                    color: $whiteColor;
                    border-radius: 20px;
                    font-size: 12px;
                    height: 30px;
                    width: 220px;
                    .iconfont {
                        position: relative;
                        top: 2px;
                        @include padding_l(10px);
                    }
                }

            }
        }
    }

}
.project-multiple-checkbox {
    .el-checkbox {
        width: 30%;
        @include margin_b(10px);
        @include margin_r(10px);
    }
    .el-checkbox.is-bordered+.el-checkbox.is-bordered {
        @include margin_r(10px);
        @include margin_l(0);
        &:nth-child(3n) {
            @include margin_r(0);
        }
    }

}
.project-multiple-button {
    .search-btn {
        @include margin_l(20px);
        position: relative;
        top: -2px;
    }
}
</style>
