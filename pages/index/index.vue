<template>
	<view class="content">
		<view class="body">
			<view v-for="(item, index) in arr" :key="index" :id="'message' + item.message_id">
				<view class="body_l" v-if="item.role == 'assistant'">
					<view class="body_lpic a">
						<image src="/static/panda.png" mode=""></image>
					</view>
					<view class="body_box">
						<view class="body_jt">
							<u-icon name="play-left-fill" color="#F6F7FB" size="20"></u-icon>
						</view>
						<!-- <view class="body_lcon pdg" v-html="item.content"></view> -->
						<view class="body_rcon pdg">
							<zero-markdown-view :markdown="item.content"></zero-markdown-view>
						</view>
						<view style="position: absolute;right: 0;bottom: 10rpx;">
							<u-icon @click="copy(item)" name="file-text-fill" size="30"></u-icon>
						</view>
					</view>
				</view>
				<view class="body_r" v-if="item.role == 'user'">
					<view class="body_box">
						<view class="body_rjt">
							<u-icon name="play-right-fill" color="#F6F7FB" size="20"></u-icon>
						</view>
						<!-- <view class="body_rcon pdg" v-html="item.content"> -->
						<view class="body_rcon pdg">
							<zero-markdown-view :markdown="item.content"></zero-markdown-view>
						</view>
					</view>
					<view class="body_rpic a">
						<!-- <image v-if="token != ''" :src="vals.avatar" mode="aspectFill"></image> -->
						<image src="/static/head.png" mode="aspectFill"></image>
					</view>
				</view>
			</view>
		</view>
		<view class="body_l" v-if="loading" style="margin-left: 30rpx;" id="loading">
			<view class="body_lpic a">
				<image src="/static/head.png" mode=""></image>
			</view>
			<view class="body_box ">
				<view class="body_lcon pdg" style="display: flex;overflow-x: hidden;">
					<u-loading-icon :show="loading"></u-loading-icon>
					<view v-if="!typeingText" style="padding: 30rpx;">思考中...</view>
					<!-- <zero-markdown-view v-if="!typeingText" style="padding: 0 20rpx;" :markdown="now_model.title">思考中...</zero-markdown-view> -->
					<!-- <view v-else style="padding: 30rpx;">{{ typeingText }}...</view> -->
					<zero-markdown-view v-else style="padding: 0 20rpx;" :markdown="typeingText"></zero-markdown-view>
				</view>
			</view>
		</view>
		<view class="flooer">
			<view class="flooer_l">
				<u--textarea v-model="prompt" placeholder="请输入内容,开始体验与人工智能交流吧" border="none" autoHeight
					style="background-color: #F6F7FB;" :maxlength="256" holdKeyboard :showConfirmBar="false"
					:cursorSpacing="28"></u--textarea>
				<!-- <u--input placeholder="请输入内容,开始体验与人工智能交流吧" border="none" clearable v-model="prompt"
					placeholderStyle="color: #7F8084"></u--input> -->
			</view>
			<view class="flooer_r pdg" @click="sendout">
				<view class="flooer_rpic a">
					<image src="../../static/fasong.png" mode=""></image>
				</view>
			</view>
		</view>
		<view style="height: 108rpx;"></view>
	</view>
</template>

<script>
	import setting from "@/common/config";
	//markdown相关插件
	// import markdownFunc from '@/uni_modules/jo-markdown/components/jo-markdown/index.js';
	// #ifdef H5
	import axios from 'axios'
	// #endif
	import {
		mapState
	} from "vuex"
	import alert from "../../uni_modules/uview-ui/libs/config/props/alert";
	var that;
	export default {
		data() {
			return {
				prompt: '',
				arr: [],
				timer: null,
				loading: false,
				chat_id: '',
				msgId: '',
				typeingText: "",
				typeingId: "",
				now_model: {},
			}
		},
		computed: {
			...mapState(['config', 'num', 'userInfo'])
		},
		onLoad() {
		    let that = this;
			let userInfo = uni.getStorageSync('userInfo')
			let token = uni.getStorageSync('token')
			that.msgId = userInfo.userId
			console.log("msgId====",userInfo.userId)
			uni.setNavigationBarTitle({
				title: "智能机器人胖胖"
			})
			that.arr.push({
				role: 'assistant',
				content: '你好，我是智能机器人胖胖！我可以回答你所有的问题',
				message_id: 'aa'
			})
		
			let pong = '';
			uni.connectSocket({
				url:encodeURI(setting.ws + "?Authorization=Bearer " + token)
			});
			that.getMessages()
			uni.onSocketOpen(function(res) {
				console.log('chat页WebSocket连接已打开！');
				// 绑定UID
				// sendMsg({
				// 	type: 'login',
				// 	uid: userInfo.member_id
				// 	// uid: 3
				// })
				// 设置心跳包
				// pong = setInterval(() => {
				// 	uni.sendSocketMessage({
				// 		data: "ping"
				// 	})
				// }, 20 * 10000);
			});
			uni.onSocketError(function(res) {
				console.log('websocket参数=========',setting.ws + "?Authorization=Bearer " + token)
				console.log('WebSocket连接打开失败，请检查！',res);
			});
			uni.onSocketMessage(function(res) {
				console.log('收到服务器内容：===', res);
				if (res.data == "[DONE]") {
					that.loading = false;
					that.arr.push({
						role: 'assistant',
						content: that.typeingText
					});
					that.$nextTick(() => {
						uni.pageScrollTo({
							scrollTop: 20000,
							duration: 100
						});
					});
					// 保存回复信息
					that.sub(that.typeingText, "assistant");
					that.typeingText = '';
					return;
				}
				let json = JSON.parse(res.data)
				if (json.content) {
					that.typeingText += json.content
				}
				that.$nextTick(() => {
					uni.pageScrollTo({
						scrollTop: 20000,
						duration: 100
					});
				});
			});
			// socket断开时通知后端改变登录状态
			uni.onSocketClose(function(res) {
				console.log('WebSocket 已关闭！');
			});
		},
		onUnload() {
			uni.closeSocket()
		},
		onShow() {
			that = this;
			// uni.getStorage({
			// 	key: 'token',
			// 	success: function(res) {
			// 		that.token = res.data;
			// 	},
			// 	fail() {
			// 		that.token = '';
			// 	}
			// });
		},
		onBackPress() {
			// uni.hideLoading()
			// clearInterval(this.timer);
		},
		onHide() {
			// uni.hideLoading()
			// clearInterval(this.timer);
		},
		methods: {
			getMessages() {
				this.$request("/chat/message/list", "Get", {
					"userId": this.msgId,
					"current": 0,
					"size": 20
				},{'content-type': 'application/json'}).then((res) => {
					console.log(res);
					if (res.code == 200) {
						console.log("res.data====",res.rows)
						this.arr = this.arr.concat(res.rows)
						this.$nextTick(() => {
							uni.pageScrollTo({
								selector: "#message" + 20,
								duration: 100
							});
						});
						//uni.hideLoading()
					} else {
						this.$failToast('服务器繁忙，请稍后再试');
					}
				});
			},
			sendout() {
				const userInfo = uni.getStorageSync('userInfo');
				if (!this.prompt) {
					this.$failToast("请输入内容");
					return;
				}

				if (userInfo.num < 1) {
					this.$failToast("提问次数不足,请联系客服充值!");
					return;
				}

				uni.sendSocketMessage({
					data: this.prompt
				});
				this.loading = true;
				this.arr.push({
					role: 'user',
					content: this.prompt,
					message_id: this.arr.length + 1
				});
				// 保存发送信息
				this.sub(this.prompt, "user");
				let message = this.prompt;
				this.prompt = ""
				this.$nextTick(() => {
					uni.pageScrollTo({
						selector: "#loading",
						duration: 100
					});
				});
			},
			// 保存消息
			sub(message, role) {
				this.$request("/chat/message/send", "POST", {
					"content": message,
					"role": role,
					"userId": this.msgId
				},{'content-type': 'application/json'}).then((res) => {
					if (res.code == 200) {
						console.log("消息保存成功!");
					} else {
						this.loading = false;
						this.$failToast(res.message);
					}
				}).catch(err => {
					console.log(err)
					this.loading = false;
					this.$failToast(err.errMsg);
				})
			},
			copy(item) {
				uni.setClipboardData({
					data: item.content,
					success() {
						uni.showModal({
							title: '提示',
							content: '内容已复制到系统剪贴板'
						})
					}
				})
			}
		}
	}
</script>

<style>
	@import '../../components/css/index.css';
</style>