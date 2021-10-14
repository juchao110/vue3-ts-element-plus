<template>
<router-view :height="height"></router-view>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	ref,
	onMounted
} from 'vue';
import {
	useStore
} from 'vuex';
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		const height = ref(document.documentElement.clientHeight - 265);
		return {
			height
		}
	}
})
</script>
