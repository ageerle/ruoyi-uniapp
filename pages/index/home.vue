<template>
	<view>
		<view class="margin-top-xl">
			<view v-if="true" class="flex align-center justify-center flex-direction padding-xl margin-top-lg">
				<image src='/static/panda.png' mode="aspectFill"
							style="background-color: #f4f5f6;width:158rpx;height: 160rpx;" class="round"></image>
								<view class="text-bold text-xxl text-orange padding-tb"> AI助手胖胖 </view>
		<!--<view style="width: 650rpx;" class="padding-bottom" v-if="config.home_notice">
					<u-notice-bar :text="config.home_notice" mode="closable"></u-notice-bar>
				</view> -->
				<view class="cu-card bg-gradual-blue padding shadow-blur radius text-lg"
					style="line-height: 1.5;text-align: justify;">
					{{'你好，欢迎体验PandaRobot！我是您的AI助手胖胖，胖胖采用了最先进的人工智能技术，能够根据您的问题进行智能匹配，快速提供最优解答。还可以根据您的需求，为您提供更加个性化的服务，例如根据您的兴趣爱好推荐相关的书籍、电影等。如您有使用问题，可以查阅个人中心-使用指南！' }}
				</view>
			</view>
		</view>
		<view class="flex justify-center align-center flex-direction">
			<button @click="toChat" style="width: 650rpx;height: 100rpx;" class="cu-btn lines-orange text-bold round">
				开始咨询 </button>
		</view>

		<view class="tool padding-top-xl">
			<view class="header">
				<view class="title text-bold">功能特性</view>
			</view>
			<u-transition :show="true" mode="slide-up">
				<view class="grid">
					<view class="item">
						<view class="icon">
							<u-icon size="28"
								name="https://img.alicdn.com/imgextra/i1/2064565174/O1CN01v7Y9311o5k2r5Rwaq_!!2064565174.png">
							</u-icon>
						</view>
						<view class="title">AI回答</view>
						<view class="desc">浩繁法条直取答案</view>
					</view>
					<view class="item">
						<view class="icon">
							<u-icon size="28"
								name="https://img.alicdn.com/imgextra/i1/2064565174/O1CN01H200mY1o5k2ythU1B_!!2064565174.png">
							</u-icon>
						</view>
						<view class="title">智能答案</view>
						<view class="desc">免去千篇一律</view>
					</view>
					<view class="item">
						<view class="icon">
							<u-icon size="28"
								name="https://img.alicdn.com/imgextra/i1/2064565174/O1CN01FDSoxG1o5k2xjTHUD_!!2064565174.png">
							</u-icon>
						</view>
						<view class="title">精准定位</view>
						<view class="desc">免去繁琐搜索</view>
					</view>
					<view class="item">
						<view class="icon">
							<u-icon size="28"
								name="https://img.alicdn.com/imgextra/i4/2064565174/O1CN01UP4ksa1o5k2rDpdOP_!!2064565174.png">
							</u-icon>
						</view>
						<view class="title">引导提示</view>
						<view class="desc">AI发散思维</view>
					</view>
					<view class="item">
						<view class="icon">
							<u-icon size="28"
								name="https://img.alicdn.com/imgextra/i2/2064565174/O1CN01Oep4C01o5k2zlWs2q_!!2064565174.png">
							</u-icon>
						</view>
						<view class="title">安全限制</view>
						<view class="desc">道德逻辑自洽</view>
					</view>
					<view class="item">
						<view class="icon">
							<u-icon size="28"
								name="https://img.alicdn.com/imgextra/i1/2064565174/O1CN01onUFC01o5k2uPHOqj_!!2064565174.png">
							</u-icon>
						</view>
						<view class="title">提纲梳理</view>
						<view class="desc">AI自动生成大纲</view>
					</view>
				</view>
			</u-transition>
		</view>
<!-- 		<view class="padding-tb" v-if="config.copyright">
			<u-loadmore :line="true" status="loadmore" :loadmoreText="config.copyright" color="#909399"></u-loadmore>
		</view> -->
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {

			}
		},
		computed: {
			...mapState(['config', 'num', 'userInfo', 'token', 'main_model'])
		},
		onLoad() {

		},
		onShareAppMessage() {
			console.log('转发+1')
		},
		methods: {
			toChat() {
				uni.navigateTo({
					url: "./index?model=" + JSON.stringify(this.main_model)
				})
			},
			toTax() {
				uni.showModal({
					content: "待开放，模型训练中..."
				})
			}
		}
	}
</script>
<style>
	/*每个页面公共css */
	@import url("@/static/style/color-ui.css");
</style>

<style lang="scss">
	.tool {
		width: 90%;
		margin: 15rpx auto;

		.header {
			.title {
				margin-bottom: 30rpx;
			}
		}

		.grid {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;

			.item {
				width: 30%;
				display: flex;
				flex-direction: column;
				align-items: center;
				background-color: #F0FAF8;
				margin: 15rpx 0rpx;
				padding: 30rpx 0rpx;
				border-radius: 10rpx;

				.title {
					color: #1B2B20;
					margin-top: 15rpx;
				}

				.desc {
					color: #67776C;
					font-size: 24rpx;
				}
			}
		}
	}
</style>
