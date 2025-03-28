<template>
	<view>
		<view class="spinner-container">
			<view class="spinner spinner--rotate-square-2">
			</view>
			<view class="site-title">
				{{ 'loading...' }}
			</view>
		</view>

	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {

			}
		},
		onLoad() {
			// #ifdef MP-WEIXIN
			uni.login({
				success: (res) => {
					if (res.errMsg == 'login:ok') {
						this.$request("/auth/visitorLogin", "Post", {
							code: res.code,
							type: 1
						}, {
							'content-type': 'application/json'
						}).then((res) => {
							if (res.code == 200) {
								// token保存到缓存 跳转到主页
								uni.setStorageSync('userInfo', res.data.userInfo);
								uni.setStorageSync('token', res.data.token)
								console.log("登录成功!", res)
								uni.reLaunch({
									url: '../index/home'
								});
							}
						});
					}
				}
			})
			// #endif

			// #ifndef MP-WEIXIN
			let token = uni.getStorageSync('token')
			if (token) {
				uni.reLaunch({
					url: '../index/home'
				});
			} else {
				uni.reLaunch({
					url: '../h5/login'
				});
			}
			uni.reLaunch({
				url: '../h5/login'
			});
			// #endif
		},
		computed: {

		},
		watch: {

		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.site-title {
		padding-top: 40rpx;
		font-size: 16px;
		color: #41b883;
	}

	.spinner-container {
		flex-direction: column;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.spinner {
		position: relative;
		width: 60px;
		height: 60px;
	}

	.spinner::before {
		content: "";
		width: 100%;
		height: 20%;
		min-width: 5px;
		background: #000;
		opacity: .1;
		position: absolute;
		bottom: 0;
		left: 0;
		border-radius: 50%;
		animation: rotate-square-2-shadow .5s linear infinite;
	}

	.spinner::after {
		content: "";
		width: 100%;
		height: 100%;
		background: #41b883;
		animation: rotate-square-2-animate .5s linear infinite;
		position: absolute;
		bottom: 40%;
		left: 0;
		border-radius: 3px;
	}

	@keyframes rotate-square-2-animate {
		17% {
			border-bottom-right-radius: 3px;
		}

		25% {
			transform: translateY(20%) rotate(22.5deg);
		}

		50% {
			transform: translateY(40%) scale(1, .9) rotate(45deg);
			border-bottom-right-radius: 50%;
		}

		75% {
			transform: translateY(20%) rotate(67.5deg);
		}

		100% {
			transform: translateY(0) rotate(90deg);
		}
	}

	@keyframes rotate-square-2-shadow {

		0%,
		100% {
			transform: scale(1, 1);
		}

		50% {
			transform: scale(1.2, 1);
		}
	}
</style>