<template>
<div class="all-body">
	<Header @uuid="getUuid" @uuids="getUuids"></Header>
	<div class="main-content">
		<div class="menu-col">
			<Menu></Menu>
		</div>
		<div class="body-col" v-loading="common.loading">
			<Bread></Bread>
			<div class="body-content">
				<router-view :key="pageKey"></router-view>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Header from '@/components/Header.vue'
import Menu from '@/components/Menu.vue'
import Bread from '@/components/Bread.vue'
import {
	reactive,
	toRefs,
	defineComponent
} from 'vue';
import {
	useStore
} from 'vuex';
export default defineComponent({
	components: {
		Header,
		Menu,
		Bread
	},
	setup() {
		const store = useStore();
		const state = store.state;
		const data = reactive({
			pageKey: '',
			common: state.common
		})
		const getUuid = (id: string) => {
			data.pageKey = id;
		};
		const getUuids = (ids: Array < string | number > ) => {
			data.pageKey = Math.random() + '';
		}
		return {
			...toRefs(data),
			getUuid,
			getUuids
		}
	}
})
</script>

<style lang="scss" >
@import '@/assets/scss/common.scss';
.all-body {
    .main-content {
        display: flex;
        justify-content: flex-start;
        height: calc(100vh - 50px);
        .menu-col {
            width: 220px;
            height: 100%;
            overflow: scroll;
            overflow-x: hidden;
            background: #30333a;
        }
        .body-col {
            width: calc(100% - 200px);
            @include padding_l(20px);
            @include padding_r(20px);
            background: $whiteColor;
            // background: #f3f5fa;
            height: 100%;
            overflow: hidden;
            .body-content {
                height: calc(100% - 70px);
                @include padding_b(10px);
                overflow: scroll;
            }
        }
    }
}
</style>
