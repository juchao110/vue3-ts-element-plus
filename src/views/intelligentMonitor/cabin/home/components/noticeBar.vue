<template lang="html">
  <div class="noticebar" :style="{backgroundColor: options.background}">
    <div style="margin-left:5px"></div>
    <div ref="parent" class="parent">
      <p ref="content" :style="{fontSize:options.size?options.size:'14px',color:options.color?options.color:'#f60'}" class="content">
        <template v-if="type == 'text'">
          {{ dataText }}
        </template>
        <template v-if="type == 'list'">
          <span class="content-inside" v-for="(n,index) in list" :key="index">
            {{ n.text }}
          </span>
        </template>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import {
	defineComponent,
	reactive,
	toRefs,
	watch,
	ref,
	computed,
	onMounted,
	nextTick,
	onBeforeUnmount
} from "vue";
import {
	notice
} from '../../interface';
import {
	_filter
} from '@/utils/lodash';
export default defineComponent({
	name: 'noticeBar',
	props: {
		options: {
			type: Object,
			default () {
				return {
					text: '默认'
				};
			}
		},
		type: {
			type: String,
			default: 'text'
		},
		dataText: {
			type: String,
			default: ''
		},
		data: {
			type: Array,
			default () {
				return []
			}
		},
	},
	setup(props: any, context: any) {

		let content: any = ref(null);
		let parent: any = ref(null);
		const data: notice = {
			speed: props.options.speed, // 速度（单位px/s）
			parentWidth: 0, // 父级宽度
			parentHeight: 0, // 父级高度
			contentLength: 0, // 文本长度
			state: 1,
			firstAnimationTime: 0, // 状态一动画效果
			secondAnimationTime: 0, // 状态二动画效果
		};
		const pageData = reactive(data);
		const list = computed(() => props.data);

		const start = async () => {
			await nextTick();
			pageData.state = 1;
			// 清空上次的动画
			content.value.style.animation = '';
			Listener();
			setAnimation();
		};

		const setAnimation = async () => {
			await nextTick();
			let style: any = document.styleSheets[0];
			// 切换数据需删除之前的注册事件
			_filter(style.cssRules, (e: any, index: number) => {
				return style.cssRules[index].name === 'firstAnimation' || style.cssRules[index].name == 'secondAnimation'
			}).map((i: any) => {
				style.deleteRule(i);
			})
			pageData.parentWidth = parent.value.offsetWidth;
			pageData.parentHeight = parent.value.offsetHeight;
			content.value.style.lineHeight = pageData.parentHeight + 'px';
			pageData.contentLength = content.value.offsetWidth;
			ComputationTime(); // 计算时间
			var s1 = style.insertRule(
				`@keyframes firstAnimation {0%   {left:0px;}100%  {left:-${pageData.contentLength}px;}}`,
				style.cssRules.length
			);
			var s2 = style.insertRule(
				`@keyframes secondAnimation {0%   {left:${pageData.parentWidth}px;}100%  {left:-${pageData.contentLength}px;}}`,
				style.cssRules.length
			);
			setTimeout(() => {
				changeState();
			}, props.options.delay);
		};

		const ComputationTime = () => {
			pageData.firstAnimationTime = pageData.contentLength / pageData.speed;
			pageData.secondAnimationTime = (pageData.contentLength + pageData.parentWidth) / pageData.speed;
		};
		const changeState = () => {
			if (pageData.state == 1) {
				content.value.style.animation = `firstAnimation ${pageData.firstAnimationTime}s linear`;
				pageData.state = 2;
			} else {
				content.value.style.animation = `secondAnimation ${pageData.secondAnimationTime}s linear infinite`;
			}
		}
		const Listener = async () => {
			await nextTick();
			content.value.addEventListener(
				'animationend',
				() => {
					changeState();
				},
				false
			);
		}
		onMounted(() => {
			start();
		})
		onBeforeUnmount(() => {
			content.value.removeEventListener('animationend', () => {}, false);
		});
		return {
			...toRefs(pageData),
			...props,
			list,
			parent,
			content
		}
	}
})
</script>

<style lang="scss" scoped>
.noticebar {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: #fff7cc;
    .parent {
        overflow: hidden;
        white-space: nowrap;
        margin: 0 auto;
        height: 100%;
        width: 100%;
        position: relative;
        .content {
            position: absolute;
            display: inline-block;
            padding: 2px 0;

            .content-inside {
                display: inline-block;
                margin-right: 50px;
            }
        }
    }
}
</style>
