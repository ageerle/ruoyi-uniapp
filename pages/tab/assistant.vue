<template>
	<view class="container">
		<view class="form">
			<u-transition :show="true" mode="slide-left">
				<!-- <pageNav :admin="admin" title="一键AI问答" desc="知你困境，解你烦恼，AI帮你写答案;绘声绘色，绘精彩;"
					img="https://wx.qlogo.cn/mmhead/Q3auHgzwzM55kOdw21icYsGmEojHmk3XMqRLWIZPkZJ6uBLvqdf6SxA/0" /> -->
				<view class="head">
					<view class="head-top">
						<image class="logo" src="/static/aichat.png"></image>
						<view class="head-top-right">
							<view class="ai-consult">
								<view class="ai">
					    <view class="ai-btn">一键AI问答</view>
									<!-- <view class="member">会员中心</view> -->
								</view>
								<view class="consult">
									<view class="consult-btn">
										<u-button open-type='contact' color="#FF9900" :plain="true" text="咨询客服"></u-button>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="head-bottom">
						<text class="description">知你困境，解你烦恼，AI帮你写答案;绘声绘色，绘精彩;</text>
					</view>
				</view>
			</u-transition>
		</view>
		<u-transition :show="true" mode="slide-right">
			<view class="tool_list">
				<view class="group_tool_wrap" v-for="item in models" :key="item.assistant_id" @click="handleJump(item)">
					<view class="label_wrap" style="background-color: #FF9900" v-if="item.tag">{{item.tag}}</view>
					<view class="label_wrap" v-else></view>
					<view class="tool_wrap">
						<view class="tool_info">
							<view class="tool_name">{{item.title}}</view>
							<view class="tool_hint">{{item.description}}</view>
						</view>
						<u--image :showLoading="true" :src="item.icon" width="80rpx" height="80rpx"></u--image>
					</view>
				</view>
			</view>
		</u-transition>
	</view>
</template>

<script>
	// import {
	// 	handleConfig,
	// 	handleTime
	// } from "@/uni_modules/chao-AI/js_sdk/common.js"
	// import {
	// 	getAppla, recognition
	// } from "@/uni_modules/chao-AI/js_sdk/index.js"
	// import pageNav from "@/uni_modules/chao-AI/components/page-nav.vue"
	import { mapState } from "vuex"
	export default {
		// components: {
		// 	pageNav
		// },
		data() {
			return {
			};
		},
		computed: {
			...mapState(['models'])
		},
		async onLoad() {
			// await recognition()
			// const flag = await handleTime()
			// const value = uni.getStorageSync('config');
			// const that = this
			// if (value && flag) {
			// 	const {
			// 		admin
			// 	} = value
			// 	that.admin = admin
			// 	const data = {
			// 		pageIndex: 1,
			// 		pageSize: 12
			// 	}
			// 	await this.handlegetAppla(data)
			// 	return
			// }
			// uni.login({
			// 	provider: "weixin",
			// 	success(res) {
			// 		uni.showLoading({
			// 			title: '加载中',
			// 			mask: true
			// 		})
			// 		that.handlefig(res.code)
			// 	}
			// })
		},
		onShareAppMessage: function() {
			return {
				title: '一键AI问答',
				imageUrl: '/static/wenda.png',
			};
		},
		onShareTimeline: function() {
			return {
				title: '一键AI问答',
				imageUrl: '/static/wenda.png',
			};
		},
		methods: {
			async handlegetAppla({
				pageIndex,
				pageSize
			}) {
				const res = await getAppla({
					id: uni.getAccountInfoSync().miniProgram.appId,
					pageIndex,
					pageSize
				})
				this.list = res.data
			},
			handleJump(item) {
				uni.navigateTo({
					url: "/pages/index/index?model=" + JSON.stringify(item)
				})
			},
			async handlefig(code) {
				const res = await handleConfig(code)
				const {
					admin
				} = res
				this.admin = admin
				const data = {
					pageIndex: 1,
					pageSize: 12
				}
				await this.handlegetAppla(data)
				uni.hideLoading()
			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f3f3f3;
		box-sizing: border-box;
		letter-spacing: 0;
		word-wrap: break-word;
	}

	.form {
		background-color: #fff;
		// padding-top: 30%;
		border-bottom-left-radius: 30rpx;
		border-bottom-right-radius: 30rpx;
		padding: 0 30rpx;
		/* #ifndef H5 */
		padding-top: var(--status-bar-height);
		margin-top: 60rpx;
		/* #endif */
	}
	
	.head-top {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	}
	
	.logo {
	  width: 30%;
	  height: 6rem;
	  max-width: 120px;
	  margin-right: 10px;
	}
	
	.head-top-right {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  flex: 1;
	}
	
	.ai-consult {
	  display: flex;
	  flex-direction: column;
	  justify-content: space-between;
	  align-items: center;
	}
	
	.ai {
	  display: flex;
	}
	
	.ai-btn {
	  padding: 6px 14px 6px 0px;
	  font-weight: bold;
	  border-radius: 4px;
	  font-size: 18px;
	  margin: 8px 0px 0px 10px;
	}
	
	.member {
	  font-size: 12px;
	  color: #f6c244;
	  margin-top: 10px;
	  flex: 1;
	}
	
	.consult {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-top: 10px;
	}
	
	.consult-btn {
	  padding: 6px 10px;
	  color: #7369ff;
	  font-size: 8px;
	  width: 150px;
	  text-align: center;
	}
	
	.admin-btn {
	  padding: 6px 10px;
	  background-color: #23c27e;
	  color: #ffffff;
	  border-radius: 4px;
	  font-size: 16px;
	  margin-left: 10px;
	}
	
	.head-bottom {
	  padding: 10px 0;
	}
	
	.description {
	  font-size: 12px;
	  color: #333333;
	}

	.tool_list {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		padding: 0 20rpx;
		align-items: stretch;
		padding-bottom: 60rpx;

		.group_tool_wrap {
			min-height: 168rpx;
			width: 347rpx;
			border-radius: 10rpx;
			background-color: #fff;
			box-shadow: 2px 2px 5px #f8f8f8;
			margin-top: 20rpx;

			.label_wrap {
				display: flex;
				width: 60rpx;
				height: 32rpx;
				border-radius: 3px;
				color: #fff;
				font-size: 20rpx;
				font-weight: 500;
				justify-content: center;
				align-items: center;
				position: relative;
				left: 287rpx;
				z-index: 1;
			}

			.tool_wrap {
				box-sizing: border-box;
				width: 100%;
				display: flex;
				padding: 0 30rpx 30rpx 30rpx;

				.tool_info {
					flex: 1;

					.tool_name {
						font-size: 28rpx;
						font-weight: 600;
						color: #333;
					}

					.tool_hint {
						margin-top: 15rpx;
						font-size: 18rpx;
						font-weight: 500;
						color: #999;
					}
				}

				image {
					margin-left: 10rpx;
				}
			}
		}
	}
</style>
