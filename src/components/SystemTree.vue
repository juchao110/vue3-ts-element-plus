<template>
<div class="">
	<el-checkbox v-model="single" @change="singleChange">单选</el-checkbox>
	<el-tree :data="treeList" ref="treeRef" show-checkbox node-key="uuid" @check="checkChange" :check-strictly="true" :props="defaultProps" :default-expand-all="true">
	</el-tree>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	getCurrentInstance,
	reactive,
	toRefs,
	ref,
	onMounted,
	watch,
	computed,
	nextTick
} from 'vue';
import {
	useStore
} from 'vuex';
import {
	_uniq
} from '@/utils/lodash';
interface tree {
	single: Boolean,
		defaultProps ? : any,
		checkedList: Array < [] >
}
export default defineComponent({
	props: {
		treeData: {
			type: Object,
			default: {}
		},
		needProjectUuid: {
			type: Boolean,
			default: false
		}
	},
	setup(props: any, {
		emit
	}: any) {
		const store = useStore();
		const state = store.state;
		let treeRef: any = ref(null);
		const obj: tree = {
			single: false,
			defaultProps: {
				children: 'nodes',
				label: (data: any, node: any) => {
					return data.t ? data.t.name : ''
				},
			},
			checkedList: [],
		};
		const pageData = reactive(obj);
		const treeList = computed(() => [props.treeData]);
		watch(treeList, (nv, ov) => {
			setData(treeList.value);
		})
		const setData = (nodes: any) => {
			for (let i = 0; i < nodes.length; i++) {
				nodes[i].uuid = nodes[i].t.uuid
				setData(nodes[i].nodes)
			}
		};
		const checkChange = (data: any, node: any) => {
			if (pageData.single) {
				// 单选时如果已经选中就不做处理
				if (pageData.checkedList[0] && pageData.checkedList[0] == data['uuid']) {
					treeRef.value.setCheckedKeys([data['uuid']])
					return false
				}
				pageData.checkedList = []
				treeRef.value.setCheckedKeys([data['uuid']])
				pageData.checkedList.push(data['uuid'])
			} else {
				// 如果已选中就反选
				if (pageData.checkedList.indexOf(data['uuid']) > -1) getTreeKey([data], 'delete')
				else getTreeKey([data], 'add')
				treeRef.value.setCheckedKeys(pageData.checkedList)
			}
			if (!props.needProjectUuid) {
				if (pageData.checkedList.indexOf(state.common.currentProject.projectUuid) > -1) pageData.checkedList.splice(pageData.checkedList.indexOf(state.common.currentProject.projectUuid), 1)
			}
			emit('checked', pageData.checkedList)

		};
		const getTreeKey = (nodes: any, action: string) => {
			for (let i = 0; i < nodes.length; i++) {
				if (action == 'add') pageData.checkedList.push(nodes[i].uuid)
				else pageData.checkedList.splice(pageData.checkedList.indexOf(nodes[i].uuid), 1)
				getTreeKey(nodes[i].nodes, action)
			}
			pageData.checkedList = _uniq(pageData.checkedList)
		};
		const singleChange = () => {
			treeRef.value.setCheckedKeys([])
			pageData.checkedList = []
		};
		onMounted(() => {
			setData(treeList)
		})
		return {
			...toRefs(pageData),
			...props,
			checkChange,
			treeList,
			treeRef,
			singleChange
		}
	}
})
</script>
