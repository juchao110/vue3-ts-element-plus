<template>
<div class="login-form-box" id="box">
	<h2>账号登录</h2>
	<div class="login-type">
		<div :class="{current:loginType==1}" @click="changeLoginType(1)">密码登录</div>
		<div :class="{current:loginType==2}" @click="changeLoginType(2)">短信登录</div>
	</div>
	<el-form label-width="80px" :model="form" :rules="formRules">
		<el-form-item label="" label-width="0" prop="mobilePhone">
			<el-input v-model="form.mobilePhone" placeholder="请输入手机号"></el-input>
		</el-form-item>
		<el-form-item label="" label-width="0" v-show="loginType==1">
			<el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
		</el-form-item>
		<el-form-item label="" label-width="0" v-show="loginType==2">
			<el-row :gutter="20">
				<el-col :span="16">
					<el-input v-model="form.code" placeholder="请输入验证码"></el-input>
				</el-col>
				<el-col :span="8">
					<Message ref="message" :phone="form.mobilePhone" @click="sendMessage"></Message>
				</el-col>
			</el-row>
		</el-form-item>
	</el-form>
	<div class="login-info">
		<div class="">
			<el-checkbox v-model="locakPassword"></el-checkbox>记住密码
		</div>
		<div class="" @click="goForget">
			忘记密码
		</div>
	</div>
	<el-button type="primary" :loading="$store.state.common.loading" class="confirm-button" @click="confirm">{{$store.state.common.loading?'登录中':'登 录'}}</el-button>


	<el-row class="down-icon" justify="space-between">
		<el-col :span="8">
			<el-tooltip :placement="height>130?'bottom':'top'" :append-to-body="false">
				<template #content>
					<div class="image-box">
						<img src="../../../assets/images/login/h5.png" alt="">
					</div>
				</template>
				<i class="iconfont wx">&#xe612;</i>
			</el-tooltip>
			<!-- <i class="iconfont wx">&#xe612;</i> -->

		</el-col>
		<el-col :span="8">
			<el-tooltip :placement="height>130?'bottom':'top'" :append-to-body="false">
				<template #content>
					<div class="image-box">
						<img src="../../../assets/images/login/ios.png" alt="">
					</div>
				</template>
				<i class="iconfont ios">&#xe783;</i>
			</el-tooltip>
		</el-col>
		<el-col :span="8">
			<el-tooltip :placement="height>130?'bottom':'top'" :append-to-body="false">
				<template #content>
					<div class="image-box">
						<p>请使用浏览器扫码下载</p>
						<img src="../../../assets/images/login/android.png" alt="">
					</div>
				</template>
				<i class="iconfont android">&#xe602;</i>
			</el-tooltip>
		</el-col>
	</el-row>
</div>
</template>
<script lang='ts'>
import {
	loginIn,
	queryUserAccessModules,
	queryProject,
} from '@/api/login';
import useGlobalFunction from '@/utils/useGlobalFunction';
import handleRoutes from '@/utils/handleRoutes';
import md5 from "js-md5";
import {
	reactive,
	toRefs,
	ref,
	nextTick,
	watch,
	getCurrentInstance,
	defineComponent,
	onMounted
} from 'vue';
import {
	useStore
} from 'vuex'
import {
	useRouter,
	useRoute
} from 'vue-router';
import Cookies from 'js-cookie';
import {
	_cloneDeep
} from '@/utils/lodash';
import {
	ElMessage
} from 'element-plus';
import {
	login
} from '../interface';
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
		const router = useRouter();
		const route = toRefs(useRoute());
		const message: any = ref(null);
		const obj: login = {
			loading: false,
			loginType: 1,
			locakPassword: true,
			form: {
				mobilePhone: getLocal('login') ? getLocal('login').phone : '',
				password: getLocal('login') ? getLocal('login').password : '',
				code: ''
			},

		}
		const pageData = reactive(obj);
		const height = ref(0);
		const changeLoginType = (type: any) => {
			pageData.loginType = type;
		};
		const sendMessage = () => {
			if (!testPhone(pageData.form.mobilePhone)) return ElMessage.error("请输入正确手机号");
			if (message.value.sending) return false;
			message.value.sendMessage();
		};
		const goForget = () => {
			emit('forget', true);
		};
		const confirm = () => {
			if (!testPhone(pageData.form.mobilePhone)) return ElMessage.error("请输入正确手机号");
			loginIn({
				mobilePhone: pageData.form.mobilePhone,
				password: md5(pageData.form.password),
				validCode: pageData.form.code,
				systemCode: "PCMNS"
			}).then((res: any) => {
				setLocal('phm_userInfo', res.data.data);
				Cookies.set('Admin-Token', res.data.data.token);
				store.dispatch('common/setUserInfo', res.data.data);
				if (pageData.locakPassword) setLocal('login', {
					phone: pageData.form.mobilePhone,
					password: pageData.form.password
				})
				queryProject({
					searchParam: "",
					userProjectGroupId: 0
				}).then((project: any) => {
					const projectList = project.data.data.projects.sort(function compareFunction(
						a: any,
						b: any
					) {
						return a.projectName.localeCompare(b.projectName, "zh");
					});
					setLocal('projectList', projectList);
					store.dispatch('common/setProjectList', projectList);
					store.dispatch('common/setCurrentProject', projectList[0]);
					queryUserAccessModules({}).then((module: any) => {
						store.commit('permission/SETRESPONSE', _cloneDeep(module.data.data));
						//store.commit('permission/HANDLEROUTER', _cloneDeep(module.pageData.data));
						pageData.loading = false;
						router.push({
							name: 'home'
						})
					})
				})
			})
		};
		const calcHeight = async () => {
			await nextTick();
			const ele: any = document.getElementById('box');
			height.value = document.body.clientHeight - ele.offsetTop - ele.clientHeight
		};
		onMounted(() => {
			console.log(calcHeight());
		});
		return {
			...toRefs(pageData),
			confirm,
			changeLoginType,
			sendMessage,
			message,
			goForget,
			height
		}
	}
})
</script>
