<template>
	<view>
		<view class="">
			<view class="topbg">
				<u--image :showLoading="true" src="https://newgpt.nauzone.cn/uploads/admin/writebg.png" width="750rpx"
					height="234rpx"></u--image>
				<view class="content-wrap">
					<view class="content">
						<view class="text-bold text-xxl">AI创作</view>
						<view class="text-bold text-lg padding-top-xs">启发灵感，专注创造</view>
					</view>
					<button class="cu-btn bg-gradual-orange round">我的创作</button>
				</view>
			</view>
			<view class="cu-bar bg-white text-orange">
				<view class="action">
					<text class="icon-titles text-orange"></text>
					<text class="text-lg text-bold">创作类型</text>
				</view>
			</view>
			<view class="padding-lr">
				<u-input v-model="title" placeholder="输入需要AI为你创作的文本类型,如:小红书文案" />
			</view>
			<view class="cu-bar bg-white text-orange padding-right">
				<view class="action">
					<text class="icon-titles text-orange"></text>
					<text class="text-lg text-bold">主要内容</text>
				</view>
				<button @click="submit" class="cu-btn line-blue radius text-bold">提交</button>
			</view>
			<view class="padding-lr ">
				<u--textarea height="90" v-model="desc"
					placeholder="输入需要AI为你创作的文本主要内容及要求,如:一个关于戒指的小红书产品文案，要求以网红种草博主的口吻，博主身份为网红女生，文案中最好多带一些emoji表情"
					:adjustPosition="false"></u--textarea>
			</view>
			<view class="cu-bar bg-white text-orange padding-right">
				<view class="action">
					<text class="icon-titles text-orange"></text>
					<text class="text-lg text-bold">🤖AI创作</text>
				</view>
				<view class="flex" v-if="answerStatus == 2">
					<button class="cu-btn line-black radius text-bold">重新生成</button>
					<view class="padding-lr-xs"></view>
					<button @click="copy" class="cu-btn line-blue radius text-bold">复制</button>
				</view>
			</view>
			<view class="padding-lr margin-bottom-sm">
				<view class="anser-area">
					<zero-markdown-view style="padding: 0;" :markdown="answer"></zero-markdown-view>
				</view>
			</view>
			<view class="cu-bar bg-white text-orange">
				<view class="action">
					<text class="icon-titles text-orange"></text>
					<text class="text-lg text-bold">常用模板</text>
				</view>
			</view>
			<view class="padding-lr">
				<view v-for="item in write_template" :key="item.write_template_id">
					<view class="flex align-center text-orange text-df">
						<view class="icon-tagfill"></view>
						<view class="text-bold">{{item.title}}</view>
					</view>
					<view v-if="item.children.length > 0" class="flex flex-wrap justify-between align-center padding-tb-sm">
						<view v-for="child in item.children" :key="child.write_template_id" class="template-card bg-orange light">
							<view class="write-title"> {{child.title}} </view>
							<view class="write-sub-title"> {{child.description}} </view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<m-tabbar fixed fill :current="0" :tabbar="tabbar"></m-tabbar>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import setting from "@/common/config";
	// #ifdef H5
	import axios from 'axios'
	// #endif
	const defaultAnswer =
		"示例：当然啦，这个小宝贝可是我最近买的戒指，色号简直跟我性格一样唯美浪漫!🎀<br />这款戒指正是小姐妹们这个春季必抢的款式，颜值一百分，戴起来非常精致又时尚。充满了异域风情的设计，让人眼前一亮🍁，收到手后也非常喜欢，与闺蜜一起百搭也好看！<br />最重要是它，真的非常适合女神们佩呢💍，完美搭配甜美的露肩甲和漂亮的耳环，让一看就不放过你，😉besides, 摸起来很光滑光润，象征着我的幸福和美满。<br />说到要买信任的童鞋肯定已经知道了，小红书上已经有好多正解的神仙姐妹种草啦，我就不再说，推而广之呀宝贝们~"
	const answerIng = 'AI创作中，请等待...'
	export default {
		data() {
			return {
				write_template: [],
				answer: defaultAnswer,
				answerStatus: 0, // 0 是默认状态，1是生成中，2是已生成
				desc: "",
				title: ""
			}
		},
		computed: {
			...mapState(['tabbar'])
		},
		onLoad() {
			console.log('log')
			// #ifdef MP-WEIXIN || MP-JD
			uni.hideHomeButton()
			// #endif
			this.getWriteTemplate()
			let that = this;
			let pong = '';
			let userInfo = uni.getStorageSync('userInfo')
			uni.connectSocket({
				url: setting.ws
			});
			uni.onSocketOpen(function(res) {
				console.log('question页WebSocket连接已打开！');
				// 绑定UID
				sendMsg({
					type: 'login',
					uid: userInfo.member_id
					// uid: 3
				})
				// 设置心跳包
				pong = setInterval(() => {
					sendMsg({
						type: 'pong'
					})
				}, 20 * 1000);

			});
			uni.onSocketError(function(res) {
				console.log('WebSocket连接打开失败，请检查！');
			});
			uni.onSocketMessage(function(res) {
				// console.log('收到服务器内容：' + res.data);
				let json = JSON.parse(res.data)
				// console.log(json)
				if (json.hasOwnProperty('id')) {
					if (that.answerStatus != 1) {
						that.answer = ""
						that.answerStatus = 1;
					}
					that.typeingId = json.id
					if (!json.choices[0].delta.finish_reason) {
						if (json.choices[0].delta.hasOwnProperty('content')) {
							that.answer += json.choices[0].delta.content
							// 此处自行斟酌是否替换
							// that.typeingText = that.typeingText.replace(/[cogptn]+/ig, "ChatGLM-6B")
						}
					}
				}

			});
			// socket断开时通知后端改变登录状态
			uni.onSocketClose(function(res) {
				console.log('WebSocket 已关闭！');
			});
			//上文中的sendMsg原型
			const sendMsg = function(data) {
				uni.sendSocketMessage({
					data: JSON.stringify(data)
				})
			}
		},
		onUnload() {
			uni.closeSocket()
		},
		methods: {
			getWriteTemplate() {
				this.$request('/api/WriteTemplate/index').then(res => {
					console.log(res)
					this.write_template = res.data.data
				})
			},
			submit() {
				if (!this.title || !this.desc) {
					this.$failToast("请输入内容");
					return;
				}

				this.answer = answerIng;
				this.sub()
			},
			sub(message) {
				// 条件编译处理，h5端uni.request与socket会互相阻塞
				// #ifndef H5
				this.$request("/api/Message/write", "POST", {
					title: this.title,
					desc: this.desc,
				}).then((res) => {
					console.log(res);
					if (res.status == 200) {
						this.answerStatus = 2;
						setTimeout(() => {
							this.answer = res.data
						}, 300);
						this.$store.commit('useNum', 1);
					} else if (res.status == 901) {
						this.loading = false;
						this.$failToast('服务器繁忙，请稍后再试');
					} else if (res.status == 411) {
						this.loading = false;
						uni.showModal({
							content: res.msg
						})
					} else {
						this.loading = false;
						this.$failToast(res.msg);
					}
				}).catch(err => {
					console.log(err)
					this.loading = false;
					this.$failToast(err.errMsg);
				})
				// #endif
				// #ifdef H5
				axios({
					method: 'post',
					url: setting.base_url + "/api/Message/write",
					data: {
						title: this.title,
						desc: this.desc,
					},
					headers: {
						'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
						'Authorization': this.$store.state.token
					}
				}).then(response => {
					console.log(response)
					let res = response.data
					if (res.status == 200) {
						this.answerStatus = 2;
						setTimeout(() => {
							this.answer = res.data
						}, 300);
						this.$store.commit('useNum', 1);
						
					} else if (res.status == 901) {
						this.loading = false;
						this.$failToast('服务器繁忙，请稍后再试');
					} else if (res.status == 411) {
						this.loading = false;
						uni.showModal({
							content: res.msg
						})
					} else {
						this.loading = false;
						this.$failToast(res.msg);
					}
				}).catch(error => {
					// reject(error);
				});
				// #endif
			},
			paset() {
				uni.getClipboardData({
					success: (res) => {
						console.log(res);
						this.prompt = res.data
					}
				});
			},
			copy() {
				uni.setClipboardData({
					data: this.answer,
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

<style lang="scss">
	.topbg {
		position: relative;

		.content-wrap {
			position: absolute;
			top: 0;
			left: 0;
			width: 750rpx;
			height: 234rpx;
			background-color: rgba(0, 0, 0, 0.39);

			.content {
				position: absolute;
				top: 60rpx;
				left: 40rpx;
				color: #fff;
			}

			.cu-btn {
				position: absolute;
				right: 40rpx;
				top: 120rpx;
			}
		}
	}
</style>

<style>
	@import url("@/static/style/color-ui.css");



	.template-card {
		/* background: #f5f8f7; */
		border-radius: 10px;
		padding: 15px;
		width: 48%;
		margin-bottom: 15px;
		height: 92px;

	}

	.write-title {
		font-size: 15px;
		font-weight: 700;
		margin-bottom: 9px;
		/* color: #000; */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.write-sub-title {
		/* color: #8f9ca2; */
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.directask {
		padding: 15px 15px 100px;
		border-top: 1px solid #ededed;
	}

	.directask .askaquestion {
		font-size: 16px;
		margin-bottom: 12px;
	}

	.textarea {
		box-shadow: 0 0 10px 5px hsla(0, 0%, 62%, .21176470588235294);
		margin-top: 15px;
		margin-bottom: 15px;
		border-radius: 10px;
		padding: 10px 15px 15px 6px;
	}

	.anser-area {
		box-shadow: 0 0 10px 5px hsla(0, 0%, 62%, .21176470588235294);
		margin-top: 20rpx;
		border-radius: 5px;
		padding: 8px;
		min-height: 120px;
	}

	.directask .askaquestion {
		font-size: 16px;
		margin-bottom: 12px;
	}

	.refresh {
		color: rgb(158, 158, 158);
		margin-right: 5px;
	}

	.case {
		color: #26b3a0;
		background: #f5f8f7;
		width: 100%;
		height: 40px;
		line-height: 40px;
		font-size: 15px;
		padding-left: 15px;
		border-radius: 5px;
		margin: 12px 0;
		border-radius: 5px;
		overflow: hidden;
		display: -webkit-box !important;
		text-overflow: ellipsis;
		word-break: break-all;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical !important;
	}
</style>
