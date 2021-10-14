<template>
<div class="login-form-box">
	<h2><span @click="goBack"><i class="el-icon-arrow-left"></i>返回登录</span>找回密码</h2>
	<el-form :model="forgetForm" class="demo-ruleForm">
		<el-form-item prop="mobilePhone">
			<el-input v-model="forgetForm.mobilePhone" placeholder="请输入手机号"></el-input>
		</el-form-item>
		<el-form-item prop="code" class="code-col clearfloat">
			<el-row :gutter="20">
				<el-col :span="16">
					<el-input v-model="forgetForm.code" placeholder="请输入验证码"></el-input>
				</el-col>
				<el-col :span="8">
					<Message ref="message" :phone="forgetForm.mobilePhone" @click="sendMessage"></Message>
				</el-col>
			</el-row>
		</el-form-item>
		<el-form-item prop="password">
			<el-input type="password" v-model="forgetForm.password" placeholder="请输入密码"></el-input>
		</el-form-item>
		<el-form-item prop="passwordAgain">
			<el-input type="password" v-model="forgetForm.passwordAgain" placeholder="请再次输入密码"></el-input>
		</el-form-item>
	</el-form>
	<el-button type="primary" class="confirm-button" @click="submit">确定</el-button>
</div>
</template>
<script lang='ts'>
import {
	defineComponent,
	reactive,
	toRefs,
	onMounted,
	ref
} from 'vue';
import {
	useStore
} from 'vuex';
import useGlobalFunction from '@/utils/useGlobalFunction';
import {
	forget
} from '../interface';
import {
	resetPassword
} from '@/api/login';
import {
	ElMessage
} from 'element-plus';
import md5 from "js-md5";
export default defineComponent({
	setup(props: any, {
		emit
	}: any) {
		const store = useStore();
		const state = store.state;
		const {
			setLocal,
			getLocal,
			testPhone,
			removeLocal
		}: any = useGlobalFunction();
		const obj: forget = {
			forgetForm: {
				mobilePhone: getLocal('login') ? getLocal('login').phone : '',
				code: '',
				password: '',
				passwordAgain: ''
			}
		};
		const pageData = reactive(obj);
		const message: any = ref(null);
		const goBack = () => {
			emit('forget', false);
		};
		const sendMessage = () => {
			if (!testPhone(pageData.forgetForm.mobilePhone)) return ElMessage.error("请输入正确手机号");
			if (message.value.sending) return false;
			message.value.sendMessage();
		};
		const submit = () => {
			if (pageData.forgetForm.password != pageData.forgetForm.passwordAgain) return ElMessage.error('两次密码不一致');
			resetPassword({
				mobilePhone: pageData.forgetForm.mobilePhone,
				validCode: pageData.forgetForm.code,
				password: md5(pageData.forgetForm.password)
			}).then((res: any) => {
				ElMessage.success(res.data.message)
				goBack();
			})
		};
		return {
			...toRefs(pageData),
			goBack,
			sendMessage,
			submit,
			message
		}
	}
})
</script>
