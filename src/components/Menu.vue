<template>
<div class="menu-component">
	<div class="menu-scroll-list">
		<el-menu :default-active="common.currentRouterPath" v-if="menuList" class="el-menu-left-menu" :router="false" @select="handleSelect" :unique-opened="false">
			<div v-if="menuList.length != 0">
				<div v-for="(r, index) in menuList.children" :key="r.name">
					<el-sub-menu :index="`${index}`" v-if="r.path != '' && r.children.length != 0">
						<template #title>
							<i class="iconfont" v-html="r.meta.font"></i>
							<span slot="title">{{ r.meta.title }}</span>
						</template>
						<el-menu-item-group>
							<span v-for="(c, cindex) in r.children">
								<span v-if="c.children.length == 0">
									<el-menu-item :index="
                    c.redirect
                      ? c.redirect
                      : `${base}/${r.path}/${c.path}`
                  " v-if="c.meta.hidden !== 'true'" :key="c.name">
										<i class="iconfont" v-html="c.meta.font"></i>
										{{ c.meta.title }}
									</el-menu-item>
								</span>
								<span class="" v-else>
									<el-sub-menu :index="
                    c.redirect
                      ? c.redirect
                      : `${base}/${r.path}/${c.path}`
                  ">
										<template #title>
											<i class="iconfont" v-html="c.meta.font"></i>
											<span slot="title">{{ c.meta.title }}</span>
										</template>
										<span v-for="d in c.children">
											<el-menu-item :index="
                        d.redirect
                          ? d.redirect
                          : `${base}/${r.path}/${c.path}/${d.path}`
                      " :key="d.name" v-if="d.meta.hidden !== 'true'">
												{{ d.meta.title }}
											</el-menu-item>
										</span>
									</el-sub-menu>
								</span>
							</span>
						</el-menu-item-group>
					</el-sub-menu>
					<div class="" v-else>
						<el-menu-item :index="
              r.redirect
                ? r.redirect
                : `${base}/${r.path}`
            " v-if="r.path != ''">
							<i class="iconfont" v-html="r.meta.font"></i>
							<span slot="title">{{ r.meta.title }}</span>
						</el-menu-item>
					</div>
				</div>
			</div>
		</el-menu>
	</div>
</div>
</template>

<script>
import {
	toRefs,
	reactive,
	computed,
	watch
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	useRoute,
	useRouter
} from 'vue-router';
import {
	ElMessage
} from 'element-plus';
import {
	_filter,
	_cloneDeep
} from '@/utils/lodash';
import {
	canAccessModule
} from '@/api/login';
import useGlobalFunction from '@/utils/useGlobalFunction';
export default {
	setup() {
		const {
			setLocal
		} = useGlobalFunction();
		const store = useStore();
		const state = store.state;
		const router = useRouter();
		const route = useRoute();
		const menuList = computed({
			get: () => state.permission.addRouters,
			set: (val) => {}
		});
		watch(() => [route.path, route.name], (nv, ov) => {
			setLocal('moduleNameUrl', nv[0], 'session');
			setLocal('moduleName', nv[1], 'session');
			setLocal('currentRouterPath', nv[0], 'session');
		})
		const data = reactive({
			common: state.common,
			base: menuList.value.path
		})
		const handleSelect = (index, indexPath) => {
			if (index.indexOf('fullScreen') > -1) {
				let routeData = router.resolve({
					path: index
				});
				window.open(routeData.href, "_blank");

			} else {
				router.push({
					path: index
				});
			}
		};

		return {
			...toRefs(data),
			menuList,
			handleSelect,
		}
	}
}
</script>

<style lang="scss">
@import '@/assets/scss/common.scss';
.menu-component {
    .menu-single-select {
        width: 220px;
        height: 100px;
        @include padding_t(10px);
        @include padding_l(10px);
        @include padding_r(10px);
        border-bottom: 1px solid #a9c3fc;
        position: relative;
        .iconfont {
            font-size: 22px;
            position: relative;
            top: 4px;
        }
        background: #e9edf7;
        .el-radio-group {
            width: 100%;
            & > label {
                display: block;
                margin-right: 0;
                padding-bottom: 10px;
                .el-radio__label {
                    font-size: 14px;
                    color: #333;
                }
                .el-radio__input {
                    display: none;
                }
                .el-radio__label {
                    display: block;
                    height: 35px;
                    line-height: 28px;
                }
                &.is-checked {
                    .el-radio__label {
                        border-radius: 5px;
                        background: #2c6af1;
                        color: #fff;
                        box-shadow: 0 3px 6px 0 rgba(4,75,197,.4);
                    }

                }

            }
        }
    }
    .menu-scroll-list {
        width: 220px;
        // height: calc(100vh - 150px);
        @include padding_b(30px);
        overflow-y: scroll;
        overflow-x: hidden;
        /*border-top: 1px solid #fff;*/
        .el-menu-item {
            height: 50px;
            line-height: 50px;
            color: #c4c4c4;
            .iconfont {
                margin-right: 10px;
                font-size: 20px;
            }
            &:hover {
                background-color: #505765;
                color: #ffffff;
            }
            &.is-active {
                color: $whiteColor;
                background: #505765;
            }
        }
        .el-menu-left-menu {
            width: 220px;
            overflow-y: scroll;
            overflow-x: hidden;
            background: #30333a;
            .el-menu--inline {
                background: #262930;
            }
            .el-menu-item-group {
                .el-menu-item-group__title {
                    display: none;
                }
                .el-menu-item {
                    padding-left: 50px !important;
                    &.is-active {
                        background-color: #505765;
                        color: #ffffff;
                    }
                    &:hover {
                        background-color: #505765;
                        color: #ffffff;
                    }
                    svg {
                        display: none;
                    }
                }

            }
        }
        .el-sub-menu__title {
            height: 50px;
            line-height: 50px;
            color: #c4c4c4;
            &:hover {
                background-color: #505765;
                color: #ffffff;
            }
            .iconfont {
                margin-right: 10px;
                font-size: 20px;
            }
        }

    }
}
</style>
