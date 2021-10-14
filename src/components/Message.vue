<template>
<div class="message-component" :style="{border:border?`1px solid ${borderColor}`:'none'}">
	<div class="send-action" v-if="sending==false">
		发送验证码
	</div>
	<div class="inter" v-else>
		<span>{{childSecond}}</span>秒后重发
	</div>
</div>
</template>

<script>
import {
	reactive,
	toRefs,
	ref,
	getCurrentInstance
} from 'vue';
import {
	ElMessage
} from 'element-plus';
import {
	getCode
} from '@/api/login/index';
export default {
	props: {
		phone: {
			type: String,
			default: ''
		},
		second: {
			type: Number,
			default: 59
		},
		border: {
			type: Boolean,
			default: true
		},
		borderColor: {
			type: String,
			default: '#2c6af1'
		}
	},
	setup(props, context) {
		const data = reactive({
			sending: false,
		});
		let childSecond = ref(props.second);
		const sendMessage = () => {
			getCode({
				mobilePhone: props.phone
			}).then(res => {
				data.sending = true;
				timer();
				ElMessage.success('发送成功');
			})
		};
		const timer = () => {
			const interTimer = setInterval(() => {
				childSecond.value--;
				if (childSecond.value < 1) {
					data.sending = false;
					childSecond.value = props.second;
					clearInterval(interTimer)
				}
			}, 1000)
		}
		return {
			...toRefs(data),
			childSecond,
			sendMessage
		}
	}
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/common.scss';
.message-component {
    width: 100%;
    height: 40px;
    line-height: 40px;
    @include padding_l(5px);
    @include padding_r(5px);
    text-align: center;
    @include border_radius(5px);
    overflow: hidden;
    .send-action {
        cursor: pointer;
    }
    .inter {
        cursor: not-allowed;
        span {
            color: $redColor;
            @include margin_r(5px);
        }
    }
}
</style>
