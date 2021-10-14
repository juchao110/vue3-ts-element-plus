<template>
<div class="login-page">
	<h4>冷库物联网资产健康管理PHM</h4>
	<div class="login-form">
		<div class="login-bg">
			<img src="../../assets/images/login/wbg.png" alt="">
		</div>
		<LoginBox v-if="!forget" @forget="getForget"></LoginBox>
		<ForgetBox v-else @forget="getForget"></ForgetBox>
	</div>
</div>
</template>

<script lang="ts">
import '@/assets/scss/common.scss';
import {
	reactive,
	toRefs,
	ref,
	watch,
	getCurrentInstance,
	defineComponent,
} from 'vue';
import LoginBox from './components/loginBox.vue';
import ForgetBox from './components/forgetBox.vue';
export default defineComponent({
	components: {
		LoginBox,
		ForgetBox
	},
	setup(props, context) {
		const forget = ref(false);
		const getForget = (data: boolean) => {
			forget.value = data;
		}
		return {
			forget,
			getForget
		}
	}
})
</script>
<style media="screen" lang="scss">
@import "@/assets/scss/common.scss";
.login-page {
    width: 100%;
    height: 100vh;
    background: url("../../assets/images/login/login_bg.jpg") center;
    background-size: cover;
    @include padding_t(100px);
    h4 {
        text-align: center;
        margin: 20px 0 40px;
        background: linear-gradient(90deg,#fff,#f9fbfd,#6299e8,#ededf3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 32px;
    }
    .login-form {
        width: 850px;
        height: 400px;
        margin: 0 auto;
        background: linear-gradient(135deg, #2178d8, #0648b6);
        @include border_radius(5px);
        display: flex;
        align-items: center;
        .login-bg {
            width: 50%;
            text-align: center;
            img {
                height: 300px;
            }
        }
        .login-form-box {
            background: $whiteColor;
            width: 50%;
            height: 100%;
            @include border_radius(5px);
            @include padding(40px);
            @include padding_b(0);
            @include padding_t(20px);
            h2 {
                font-weight: normal;
                text-align: center;
                @include margin_b(20px);
                position: relative;
                span {
                    color: $primaryColor;
                    position: absolute;
                    left: 0;
                    top: 5px;
                    font-size: 14px;
                    cursor: pointer;
                }
            }
            .login-type {
                display: flex;
                justify-content: flex-start;
                @include margin_b(10px);
                & > div {
                    @include margin_r(20px);
                    cursor: pointer;
                    &.current {
                        @include border_b(2px,$primaryColor);
                    }
                }
            }
            .login-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                @include margin_b(10px);
                & > div {
                    cursor: pointer;
                }
            }
            .confirm-button {
                width: 100%;
                display: block;
                @include margin_b(20px);
            }
            .down-icon {
                text-align: center;
                .el-col {
                    position: relative;
                    .iconfont {
                        font-size: 28px;
                        cursor: pointer;
                        &.wx {
                            color: #4fc73d;
                        }
                        &.ios {
                            color: #999;
                        }
                        &.android {
                            color: #8ec31f;
                        }
                    }
                    .image-box {
                        p {
                            @include margin_b(5px);
                        }
                        img {
                            width: 120px;
                            height: 120px;
                        }
                    }
                }

            }
        }
    }
}
</style>
