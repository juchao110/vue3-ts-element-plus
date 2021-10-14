<template>
<router-view />
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
export default defineComponent({
	setup() {
		const store = useStore();
		const state = store.state;
		return {}
	}
})
</script>
