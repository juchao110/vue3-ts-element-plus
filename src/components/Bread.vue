<template>
<div class="bread-component">
	<div class="tab-div">
		<el-tabs v-model="current" @tab-click="handleClick" @tab-remove="handleRemove" closable>
			<el-tab-pane :key="item.name" v-for="(item, index) in list" :label="item.meta.title" :name="item.name">
			</el-tab-pane>
		</el-tabs>
	</div>
	<el-tag type="danger" class="close-tag" v-if="list&&list.length>2" @click="closeAll">关闭所有</el-tag>
</div>
</template>

<script>
import {
	reactive,
	toRefs,
	computed,
	watchEffect
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	useRouter
} from 'vue-router';
import {
	ElMessage
} from 'element-plus'
import {
	_filter
} from '@/utils/lodash';
export default {
	setup(props, context) {
		const store = useStore();
		const state = store.state;
		const router = useRouter();
		const data = reactive({
			currentVal: ''
		});
		const list = computed({
			get: () => state.bread.list,
		});
		const current = computed({
			get: () => state.bread.currentNav.name,
			set: value => {
				data.currentVal = value;
			}
		})
		const handleClick = () => {
			if (_filter(state.permission.response, o => o.moduleName == data.currentVal).length == 0) return false
			router.push({
				name: data.currentVal
			})
		};
		const handleRemove = (name) => {
			if (list.value.length == 1) return ElMessage.warning('不能再关闭了！')
			if (data.currentVal == name) {
				router.push({
					name: state.bread.list[state.bread.list.map(e => e.name).indexOf(name) - 1].name
				})
			}
			store.dispatch('bread/removeCurrentNavAction', name)
		};
		const closeAll = () => {
			store.dispatch('bread/clearNavListAction', [state.bread.list[0]]);
			router.replace({
				name: state.bread.list[0].name
			})

		};

		return {
			...toRefs(data),
			list,
			current,
			handleClick,
			handleRemove,
			closeAll
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/common.scss';
.bread-component {
    position: relative;
    .tab-div {
        width: calc(100% - 80px);
    }
    .close-tag {
        position: absolute;
        right: 0;
        top: 4px;
        cursor: pointer;
    }

}
</style>
