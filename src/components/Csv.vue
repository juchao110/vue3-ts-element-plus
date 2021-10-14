<template>
<div class="" style="display:inline-block">
	<a ref="link" type="success" class="export" @click="handleClick">导出数据</a>
</div>
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
import json2csv from "json2csv";
import {
	ElMessage
} from 'element-plus';
export default defineComponent({
	props: {
		header: {
			type: Array,
			default: () => []
		},
		dataList: {
			type: Array,
			default: () => []
		},
		fileName: {
			type: String,
			default: () => ""
		}
	},
	setup(props: any) {
		const store = useStore();
		const state = store.state;
		const createDownLoadClick = (content: any, fileName: string) => {
			const link = document.createElement("a");
			link.href = encodeURI(content);
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
		const checkIE = () => {
			var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
			var isIE =
				userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
			var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
			var isIE11 =
				userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;
			if (isIE) {
				var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
				reIE.test(userAgent);
				var fIEVersion = parseFloat(RegExp["$1"]);
				if (fIEVersion == 7) {
					return 7;
				} else if (fIEVersion == 8) {
					return 8;
				} else if (fIEVersion == 9) {
					return 9;
				} else if (fIEVersion == 10) {
					return 10;
				} else {
					return 6; //IE版本<=7
				}
			} else if (isEdge) {
				return "edge"; //edge
			} else if (isIE11) {
				return 11; //IE11
			} else {
				return -1; //不是ie浏览器
			}
		}
		const handleClick = () => {
			if (!props.dataList || props.dataList.length == 0)
				return ElMessage.error("暂无数据导出");
			try {
				const result = json2csv.parse(props.dataList, {
					fields: props.header
					// excelStrings: true
				});
				if (checkIE() !== -1) {
					var BOM = "\uFEFF";
					// 文件转Blob格式
					var csvData = new Blob([BOM + result], {
						type: "text/csv"
					});
					navigator.msSaveBlob(csvData, `${props.fileName}.csv`);
				} else {
					let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + result;
					// 非ie 浏览器
					createDownLoadClick(csvContent, `${props.fileName}.csv`);
				}
			} catch (err) {
				console.log(err);
			}
		};
		return {
			handleClick
		}
	}
})
</script>
<style media="screen" lang="scss">
@import '@/assets/scss/common.scss';
.export {
    display: block;
    width: 80px;
    height: 40px;
    line-height: 40px;
    background: $primaryColor;
    text-align: center;
    border-radius: 5px;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}
</style>
